import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import ToxicologyReferencePage from './toxic'

afterEach(() => {
  cleanup()
})

describe('ToxicologyReferencePage', () => {
  it('renders the reference page with a sticky search field', () => {
    render(<ToxicologyReferencePage />)

    expect(screen.getByRole('heading', { name: 'Токсикология' })).toBeTruthy()
    expect(screen.getByLabelText('Поиск по яду или антидоту')).toBeTruthy()
    expect(screen.getByText('Найдено: 16')).toBeTruthy()
  })

  it('filters cards by antidote name', async () => {
    const user = userEvent.setup()

    render(<ToxicologyReferencePage />)

    await user.type(screen.getByLabelText('Поиск по яду или антидоту'), 'налоксон')

    expect(screen.getByText('Опиоиды')).toBeTruthy()
    expect(screen.queryByText('Парацетамол')).toBeNull()
    expect(screen.getByText('Найдено: 1')).toBeTruthy()
  })

  it('opens and closes a poison card', async () => {
    const user = userEvent.setup()

    render(<ToxicologyReferencePage />)

    const summary = screen.getByText('Парацетамол')
    const details = summary.closest('details')

    expect(details?.open).toBe(false)

    await user.click(summary)

    expect(details?.open).toBe(true)
    expect(within(details as HTMLDetailsElement).getByText('Клиническая симптоматика')).toBeTruthy()

    await user.click(summary)

    expect(details?.open).toBe(false)
  })

  it('closes the previous card when another card opens', async () => {
    const user = userEvent.setup()

    render(<ToxicologyReferencePage />)

    const paracetamolSummary = screen.getByText('Парацетамол')
    const opioidsSummary = screen.getByText('Опиоиды')
    const paracetamolDetails = paracetamolSummary.closest('details')
    const opioidsDetails = opioidsSummary.closest('details')

    await user.click(paracetamolSummary)

    expect(paracetamolDetails?.open).toBe(true)
    expect(opioidsDetails?.open).toBe(false)

    await user.click(opioidsSummary)

    expect(paracetamolDetails?.open).toBe(false)
    expect(opioidsDetails?.open).toBe(true)
  })
})
