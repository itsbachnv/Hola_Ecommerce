import React, { useState, useEffect } from 'react'
import { UseFormRegisterReturn } from 'react-hook-form'

interface VNDInputProps {
  register: UseFormRegisterReturn
  placeholder?: string
  className?: string
  error?: string
  defaultValue?: number
}

// Format number to VND display
const formatVND = (value: string | number): string => {
  // Handle both string and number input
  const numbers = String(value).replace(/\D/g, '')
  
  // Return empty if no numbers
  if (!numbers) return ''
  
  // Format with thousand separators
  return Number(numbers).toLocaleString('vi-VN')
}

// Convert VND display back to number
const parseVND = (formattedValue: string): number => {
  const numbers = formattedValue.replace(/\D/g, '')
  return numbers ? Number(numbers) : 0
}

export default function VNDInput({ register, placeholder = '0', className = '', error, defaultValue }: VNDInputProps) {
  const [displayValue, setDisplayValue] = useState('')

  // Initialize with default value if provided
  useEffect(() => {
    if (defaultValue && defaultValue > 0) {
      setDisplayValue(formatVND(defaultValue))
    }
  }, [defaultValue])
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const formatted = formatVND(inputValue)
    setDisplayValue(formatted)
    
    // Update the actual form value with the numeric value
    const numericValue = parseVND(formatted)
    
    // Call the original register onChange with numeric value
    const fakeEvent = {
      target: {
        name: register.name,
        value: numericValue.toString()
      }
    } as React.ChangeEvent<HTMLInputElement>
    
    register.onChange(fakeEvent)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Call original onBlur if it exists
    if (register.onBlur) {
      register.onBlur(e)
    }
  }

  return (
    <div className="relative">
      <input
        type="text"
        name={register.name}
        ref={register.ref}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md pr-8 ${className}`}
      />
      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
        ₫
      </span>
      {error && (
        <p className="text-red-600 text-sm mt-1">{error}</p>
      )}
    </div>
  )
}

// Hook for easier usage
export const useVNDInput = (defaultValue?: number) => {
  const [displayValue, setDisplayValue] = useState(
    defaultValue ? formatVND(defaultValue.toString()) : ''
  )

  const setValue = (value: number) => {
    setDisplayValue(formatVND(value.toString()))
  }

  const getValue = (): number => {
    return parseVND(displayValue)
  }

  return {
    displayValue,
    setDisplayValue,
    setValue,
    getValue,
    formatVND,
    parseVND
  }
}
