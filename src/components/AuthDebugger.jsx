// src/components/AuthDebugger.jsx
import React, { useState } from 'react'
import Button from './ui/Button.jsx'

const AuthDebugger = () => {
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const testLogin = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('https://web-production-c660.up.railway.app/vernora-api/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
          email: 'Harsh@example.com',
          password: 'Admin@1234'
        })
      })

      const data = await response.text()
      
      setResults(prev => [...prev, {
        endpoint: 'LOGIN',
        status: response.status,
        statusText: response.statusText,
        headers: [...response.headers.entries()],
        data: data,
        success: response.ok
      }])
    } catch (error) {
      setResults(prev => [...prev, {
        endpoint: 'LOGIN',
        error: error.message,
        success: false
      }])
    }
    setIsLoading(false)
  }

  const testRegisterVariations = async () => {
    setIsLoading(true)
    
    const variations = [
      {
        name: 'REGISTER - Standard',
        body: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        }
      },
      {
        name: 'REGISTER - With confirmPassword',
        body: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123'
        }
      },
      {
        name: 'REGISTER - Different field names',
        body: {
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        }
      },
      {
        name: 'REGISTER - Login format',
        body: {
          email: 'test@example.com',
          password: 'password123'
        }
      }
    ]

    for (const variation of variations) {
      try {
        const response = await fetch('https://web-production-c660.up.railway.app/vernora-api/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
          body: JSON.stringify(variation.body)
        })

        const data = await response.text()
        
        setResults(prev => [...prev, {
          endpoint: variation.name,
          status: response.status,
          statusText: response.statusText,
          requestBody: variation.body,
          data: data,
          success: response.ok
        }])
      } catch (error) {
        setResults(prev => [...prev, {
          endpoint: variation.name,
          error: error.message,
          success: false
        }])
      }
    }
    setIsLoading(false)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Authentication Debugger</h2>
      
      <div className="flex gap-4 mb-6">
        <Button onClick={testLogin} disabled={isLoading}>
          Test Working Login
        </Button>
        <Button onClick={testRegisterVariations} disabled={isLoading}>
          Test Register Variations
        </Button>
        <Button onClick={() => setResults([])} variant="secondary">
          Clear Results
        </Button>
      </div>

      <div className="space-y-4">
        {results.map((result, index) => (
          <div key={index} className={`p-4 rounded-lg border ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <h3 className="font-bold text-lg">{result.endpoint}</h3>
            <p className="text-sm">Status: <span className={result.success ? 'text-green-600' : 'text-red-600'}>{result.status} {result.statusText}</span></p>
            
            {result.requestBody && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm font-medium">Request Body</summary>
                <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(result.requestBody, null, 2)}
                </pre>
              </details>
            )}
            
            {result.error && <p className="text-red-600 text-sm">Error: {result.error}</p>}
            
            {result.data && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm font-medium">Response Data</summary>
                <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                  {result.data}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default AuthDebugger
