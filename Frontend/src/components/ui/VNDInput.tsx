import React, { useState, useEffect } from 'react'
import { UseFormRegisterReturn } from 'react-hook-form'

interface VNDInputProps {
  register?: UseFormRegisterReturn
  placeholder?: string
  className?: string
  error?: string
  defaultValue?: number
  value?: number
  onChange?: (value: number) => void
  name?: string
}

export default function VNDInput({ 
  register, 
  placeholder = '0', 
  className = '', 
  error, 
  defaultValue, 
  value,
  onChange,
  name
}: VNDInputProps) {
  const [displayValue, setDisplayValue] = useState('')

  // Initialize with value from form
  useEffect(() => {
    const currentValue = value ?? defaultValue ?? 0
    if (currentValue > 0) {
      setDisplayValue(new Intl.NumberFormat('vi-VN').format(currentValue))
    } else {
      setDisplayValue('')
    }
  }, [defaultValue, value])
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    
    // Remove all non-digits
    const digitsOnly = inputValue.replace(/[^\d]/g, '')
    
    // If empty, clear everything
    if (!digitsOnly || digitsOnly === '0') {
      setDisplayValue('')
      const numericValue = 0
      
      // If using with Controller (has onChange prop), call it
      if (onChange) {
        onChange(numericValue)
      }
      
      // If using with register, update form
      if (register) {
        const fakeEvent = {
          target: { name: register.name, value: numericValue.toString() }
        } as React.ChangeEvent<HTMLInputElement>
        register.onChange(fakeEvent)
      }
      return
    }
    
    // Convert to number and format with Vietnamese locale
    const number = parseInt(digitsOnly, 10)
    const formatted = new Intl.NumberFormat('vi-VN').format(number)
    
    // Update display
    setDisplayValue(formatted)
    
    // If using with Controller (has onChange prop), call it with the raw number
    if (onChange) {
      onChange(number)
    }
    
    // If using with register, update form with raw number
    if (register) {
      const fakeEvent = {
        target: { name: register.name, value: number.toString() }
      } as React.ChangeEvent<HTMLInputElement>
      register.onChange(fakeEvent)
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Call original onBlur if exists
    if (register?.onBlur) {
      register.onBlur(e)
    }
  }

  return (
    <div className="relative">
      <input
        type="text"
        name={register?.name || name}
        ref={register?.ref}
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
    defaultValue ? new Intl.NumberFormat('vi-VN').format(defaultValue) : ''
  )

  const setValue = (value: number) => {
    setDisplayValue(new Intl.NumberFormat('vi-VN').format(value))
  }

  const getValue = (): number => {
    const numbers = displayValue.replace(/[^\d]/g, '')
    return numbers ? Number(numbers) : 0
  }

  return {
    displayValue,
    setDisplayValue,
    setValue,
    getValue
  }
}
