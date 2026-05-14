import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import IdeaForm from '@/components/IdeaForm'
import { CATEGORY_FIELDS } from '@/lib/categoryFields'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

// Mock fetch
global.fetch = vi.fn()

// Radix UI Select calls scrollIntoView internally — jsdom doesn't support it
window.Element.prototype.scrollIntoView = vi.fn()

describe('CATEGORY_FIELDS config', () => {
  it('defines exactly 2 fields for each of the 5 categories', () => {
    const categories = [
      'Technical',
      'Process Improvement',
      'Client Solutions',
      'Cost Reduction',
      'Employee Experience',
    ]
    for (const cat of categories) {
      expect(CATEGORY_FIELDS[cat], `${cat} should have fields defined`).toBeDefined()
      expect(CATEGORY_FIELDS[cat]).toHaveLength(2)
    }
  })

  it('every field definition has key, label, and type', () => {
    for (const fields of Object.values(CATEGORY_FIELDS)) {
      for (const field of fields) {
        expect(field).toHaveProperty('key')
        expect(field).toHaveProperty('label')
        expect(field).toHaveProperty('type')
        expect(['text', 'textarea', 'select']).toContain(field.type)
      }
    }
  })

  it('select fields have a non-empty options array', () => {
    for (const fields of Object.values(CATEGORY_FIELDS)) {
      for (const field of fields) {
        if (field.type === 'select') {
          expect(field.options).toBeDefined()
          expect((field.options as string[]).length).toBeGreaterThan(0)
        }
      }
    }
  })
})

describe('IdeaForm — dynamic fields', () => {
  it('shows no dynamic fields before a category is selected', () => {
    render(<IdeaForm />)
    expect(screen.queryByTestId('dynamic-fields')).not.toBeInTheDocument()
  })

  it('shows Technical fields when Technical category is selected', () => {
    render(<IdeaForm />)
    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.click(screen.getByRole('option', { name: 'Technical' }))

    expect(screen.getByLabelText('Technology / Stack')).toBeInTheDocument()
    expect(screen.getByLabelText('Estimated Timeline')).toBeInTheDocument()
  })

  it('shows Cost Reduction fields when Cost Reduction is selected', () => {
    render(<IdeaForm />)
    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.click(screen.getByRole('option', { name: 'Cost Reduction' }))

    expect(screen.getByLabelText('Current Annual Cost')).toBeInTheDocument()
    expect(screen.getByLabelText('Projected Savings')).toBeInTheDocument()
  })

  it('clears dynamic fields when category changes', () => {
    render(<IdeaForm />)

    const getCategoryCombobox = () => screen.getAllByRole('combobox')[0]

    fireEvent.click(getCategoryCombobox())
    fireEvent.click(screen.getByRole('option', { name: 'Technical' }))
    expect(screen.getByLabelText('Technology / Stack')).toBeInTheDocument()

    fireEvent.click(getCategoryCombobox())
    fireEvent.click(screen.getByRole('option', { name: 'Cost Reduction' }))

    expect(screen.queryByLabelText('Technology / Stack')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Current Annual Cost')).toBeInTheDocument()
  })

  it('shows Employee Experience fields with Impact Area select', () => {
    render(<IdeaForm />)
    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.click(screen.getByRole('option', { name: 'Employee Experience' }))

    expect(screen.getByLabelText('Target Audience')).toBeInTheDocument()
    expect(screen.getByLabelText('Impact Area')).toBeInTheDocument()
  })

  it('shows Process Improvement fields with textarea for current process', () => {
    render(<IdeaForm />)
    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.click(screen.getByRole('option', { name: 'Process Improvement' }))

    const textarea = screen.getByLabelText('Current Process Description')
    expect(textarea.tagName).toBe('TEXTAREA')
    expect(screen.getByLabelText('Estimated Efficiency Gain')).toBeInTheDocument()
  })
})
