'use client'

const AppointmentDetail = () => {
  const appointmentDetails = {
    patientName: 'Amanda Kimber',
    patientEmail: 'amanda.kimber@email.com',
    time: '09:00 - 09:30',
    type: 'Consultation',
    referral: 'Dr. Helen Miller',
    diagnosis: 'Post-operative checkup',
    symptoms: 'Mild pain, swelling',
    comment: 'Patient recovering well.'
  }

  const startVideoCall = async () => {
    try {
      const response = await fetch('/api/video-call/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientEmail: appointmentDetails.patientEmail,
          patientName: appointmentDetails.patientName,
          doctorName: 'Dr. Alex Robin'
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Open video call in new window/tab
        window.open(data.callUrl, '_blank')
      } else {
        alert('Failed to start video call')
      }
    } catch (error) {
      console.error('Error starting video call:', error)
      alert('Error starting video call')
    }
  }

  return (
    <div className="col-span-2 md:col-span-1 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {appointmentDetails.patientName}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {appointmentDetails.time}
          </p>
        </div>
      </div>

      <div className="space-y-4 text-sm mb-6">
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Type</span>
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {appointmentDetails.type}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Referral</span>
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {appointmentDetails.referral}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Diagnosis</span>
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {appointmentDetails.diagnosis}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Symptoms</span>
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {appointmentDetails.symptoms}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Comment</span>
          <span className="font-medium text-gray-800 dark:text-gray-200 text-right">
            {appointmentDetails.comment}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 bg-primary text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90">
          <span>Medical Card</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
        
        <button 
          onClick={startVideoCall}
          className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-lg flex items-center justify-center transition-colors"
          title="Start Video Call"
        >
          <span className="material-symbols-outlined">videocam</span>
        </button>
      </div>
    </div>
  )
}

export default AppointmentDetail