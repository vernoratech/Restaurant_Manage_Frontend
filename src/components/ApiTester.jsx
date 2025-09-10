// src/components/ApiTester.jsx
import React, { useState } from 'react'
import Button from './ui/Button.jsx'

const ApiTester = () => {
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const testEndpoints = [
    { name: 'Register', url: '/auth/register', method: 'POST' },
    { name: 'Register Alt', url: '/register', method: 'POST' },
    { name: 'Login', url: '/auth/login', method: 'POST' },
    { name: 'Login Alt', url: '/login', method: 'POST' },
  ]

  const testEndpoint = async (endpoint) => {
    setIsLoading(true)
    const testData = {
      name: 'Test User',
      email: 'test@example.com', 
      password: 'password123'
    }

    try {
      const response = await fetch(`https://web-production-c660.up.railway.app/vernora-api/api${endpoint.url}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify(testData)
      })

      const result = {
        endpoint: endpoint.name,
        status: response.status,
        statusText: response.statusText,
        headers: [...response.headers.entries()],
        success: response.ok
      }

      // Try to get response body
      try {
        const data = await response.text()
        result.data = data
      } catch (e) {
        result.data = 'No response body'
      }

      setResults(prev => [...prev, result])
    } catch (error) {
      setResults(prev => [...prev, {
        endpoint: endpoint.name,
        error: error.message,
        success: false
      }])
    }
    setIsLoading(false)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">API Endpoint Tester</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        {testEndpoints.map((endpoint) => (
          <Button
            key={endpoint.name}
            onClick={() => testEndpoint(endpoint)}
            disabled={isLoading}
            variant="outline"
          >
            Test {endpoint.name}
          </Button>
        ))}
      </div>

      <Button
        onClick={() => setResults([])}
        variant="secondary"
        className="mb-4"
      >
        Clear Results
      </Button>

      <div className="space-y-4">
        {results.map((result, index) => (
          <div key={index} className={`p-4 rounded-lg border ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <h3 className="font-bold">{result.endpoint}</h3>
            <p>Status: {result.status} {result.statusText}</p>
            {result.error && <p className="text-red-600">Error: {result.error}</p>}
            {result.data && (
              <details className="mt-2">
                <summary className="cursor-pointer">Response Data</summary>
                <pre className="mt-2 text-sm bg-gray-100 p-2 rounded overflow-auto">
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

export default ApiTester
