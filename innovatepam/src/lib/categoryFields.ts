export interface CategoryField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'select'
  placeholder?: string
  options?: string[]
}

export const CATEGORY_FIELDS: Record<string, CategoryField[]> = {
  Technical: [
    {
      key: 'techStack',
      label: 'Technology / Stack',
      type: 'text',
      placeholder: 'e.g. React, Python, AWS',
    },
    {
      key: 'estimatedTimeline',
      label: 'Estimated Timeline',
      type: 'select',
      options: ['1 week', '1 month', '3 months', '6+ months'],
    },
  ],
  'Process Improvement': [
    {
      key: 'currentProcess',
      label: 'Current Process Description',
      type: 'textarea',
      placeholder: 'Describe the current process and its pain points',
    },
    {
      key: 'estimatedGain',
      label: 'Estimated Efficiency Gain',
      type: 'text',
      placeholder: 'e.g. 50% faster, saves 3 hrs/week',
    },
  ],
  'Client Solutions': [
    {
      key: 'clientIndustry',
      label: 'Client Industry / Sector',
      type: 'text',
      placeholder: 'e.g. Healthcare, Finance, Retail',
    },
    {
      key: 'problemSolved',
      label: 'Problem Being Solved',
      type: 'text',
      placeholder: 'What specific client problem does this address?',
    },
  ],
  'Cost Reduction': [
    {
      key: 'currentCost',
      label: 'Current Annual Cost',
      type: 'text',
      placeholder: 'e.g. $50,000/year',
    },
    {
      key: 'projectedSavings',
      label: 'Projected Savings',
      type: 'text',
      placeholder: 'e.g. $20,000/year or 40%',
    },
  ],
  'Employee Experience': [
    {
      key: 'targetAudience',
      label: 'Target Audience',
      type: 'text',
      placeholder: 'e.g. All developers, Remote employees',
    },
    {
      key: 'impactArea',
      label: 'Impact Area',
      type: 'select',
      options: [
        'Wellbeing',
        'Productivity',
        'Learning & Development',
        'Diversity & Inclusion',
      ],
    },
  ],
}

/** Human-readable labels for displaying stored metadata keys on detail pages */
export const FIELD_LABEL_MAP: Record<string, string> = Object.values(
  CATEGORY_FIELDS
)
  .flat()
  .reduce(
    (acc, f) => ({ ...acc, [f.key]: f.label }),
    {} as Record<string, string>
  )
