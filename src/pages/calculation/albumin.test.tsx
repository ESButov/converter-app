import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import AlbuminPage from './albumin'

afterEach(() => {
  cleanup()
})

describe('AlbuminPage', () => {
  it('calculates albumin volume and infusion speed after all fields are filled', async () => {
    const user = userEvent.setup()

    render(<AlbuminPage />)

    await user.type(screen.getByLabelText('Альбумин крови (г/л)'), '20')
    await user.type(screen.getByLabelText('Желаемый Альбумин (г/л)'), '25')
    await user.type(screen.getByLabelText('Масса (кг)'), '10')

    expect(await screen.findByText(/Объем 20%: 75 мл\./)).toBeTruthy()
    expect(screen.getByText(/Скорость для 20%: 6.25 мл\/ч\./)).toBeTruthy()
    expect(screen.getByText(/требуется добавить 75 мл NaCl 0\.9%/)).toBeTruthy()
    expect(screen.getByText(/Скорость для 10%: 12.5 мл\/ч\./)).toBeTruthy()
  })
})
