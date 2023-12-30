'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { parse } from 'papaparse'

export default function Home() {
  const [recipientEmails, setRecipientEmails] = useState<string[]>([])
  const [newRecipient, setNewRecipient] = useState('')
  const [subject, setSubject] = useState('')
  const [sendingInProgress, setSendingInProgress] = useState<boolean>(false)


  const addRecipient = () => {
    if (newRecipient.trim() !== '') {
      setRecipientEmails(prevEmails => [...prevEmails, newRecipient])
      setNewRecipient('')
    }
  }

  const uploadHandler = (event: { target: { files: any[] } }) => {
    parse(event.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: function (results: any) {
        const emailsFromCSV = results.data
          .map((row: any) => row.email)
          .filter((email: any) => email)
        setRecipientEmails(prevEmails => [...prevEmails, ...emailsFromCSV])
      },
    })
  }

  const removeRecipient = (index: number) => {
    const updatedRecipients = [...recipientEmails]
    updatedRecipients.splice(index, 1)
    setRecipientEmails(updatedRecipients)
  }

  const sendEmails = async () => {
    // console.log("button clicked!!!");
    setSendingInProgress(true)
    for (let i = 0; i < recipientEmails.length; i++) {
      // console.log("Loop started...");
      const formData = {
        recipientEmail: recipientEmails[i],
        subject,
        text:
          'Lorem ipsum dolor sit amet consectetur adipisicing elit@. Animi deleniti tempora reiciendis, eaque rerum asperiores ab@. Autem beatae voluptates deleniti ipsum quidem consequatur ipsa, enim dolores, repudiandae quae@, voluptatum voluptatem.',
      }
      try {
        const response = await axios.post('/api/sendEmails', formData, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        console.log(response)

        if (response.status === 200) {
          toast.success(response.data.recipientEmail)
          console.log(`Email sent to ${recipientEmails[i]} successfully!`)
          setRecipientEmails(prevEmails =>
            prevEmails.filter(email => email !== recipientEmails[i])
          )
        }
      } catch (error) {
        console.error('Error sending emails', error)
      }

      // Wait for 10 seconds before sending the next email
      await new Promise(resolve => setTimeout(resolve, 10000))
      // console.log("Loop Ended...");

      // if it is the last email in the list, set sendingInProgress to false
      if (i === recipientEmails.length - 1) {
        setSendingInProgress(false)
      }
    }
  }

  const handleSubmit = (e: any) => {
    e.preventDefault()
    sendEmails()
  }

  return (
    <div className="w-full h-screen">
      <div className="container mx-auto h-full flex flex-col md:flex-row items-center px-4">
        <ToastContainer />
        <div className="md:w-1/2 lg:w-2/3 w-full h-full grid place-items-center">
          <form onSubmit={handleSubmit} className="p-4 rounded-md border-2">
            <div>
              <h1>Send Multiple Emails</h1>
              <h1>emails left to send : {recipientEmails.length}</h1>
            </div>
            <input
              type="file"
              name="file"
              accept=".csv"
              onChange={uploadHandler}
              style={{ display: 'block', margin: '10px auto' }}
            />
            <div className="mt-4 flex items-center gap-4">
              <input
                type="text"
                placeholder="Recipient Email"
                value={newRecipient}
                onChange={e => setNewRecipient(e.target.value)}
                className="w-full h-12 border-2 outline-none rounded px-4 text-black"
              />
              <button type="button" onClick={addRecipient}>
                Add
              </button>
            </div>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Subject"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                required
                className="w-full h-12 border-2 outline-none rounded px-4 text-black"
              />
            </div>
            <button
              type="submit"
              disabled={sendingInProgress}
              className="w-full h-12 border-0 outline-none bg-green-300 text-green-800 rounded mt-4"
            >
              {sendingInProgress ? 'Sending...' : 'Send Emails'}
            </button>
          </form>
        </div>
        <div className="md:w-1/2 lg:w-1/3 w-full h-full p-4 bg-gray-100 overflow-y-scroll container-snap">
          <div className="py-4">
            <div>
              <p>Subject of the Mail:</p>
              <p>{subject}</p>
            </div>
            {recipientEmails.map((email, index) => (
              <div
                key={index}
                className="relative flex items-center justify-between my-4 border-2 rounded-md p-2"
              >
                <span>{email}</span>
                {!sendingInProgress && (
                  <button
                    type="button"
                    onClick={() => removeRecipient(index)}
                    className="bg-rose-300 text-rose-800 p-0.5 top-0 right-0 absolute rounded"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18 18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
