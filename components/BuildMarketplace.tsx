import React, { FC } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'

const Label: FC<{ htmlFor: string }> = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="reservoir-label-l mb-2">
    {children}
  </label>
)

const Fieldset: FC = ({ children }) => (
  <fieldset className="mb-4 grid">{children}</fieldset>
)

type Inputs = {
  name: string
  logo: string
  theme: string
  'primary-color': string
  'secondary-color': string
  'marketplace-type': string
  'marketplace-fee': string
  'wallet-address': string
  'body-font': string
  'header-font': string
}

const BuildMarketplace: FC<{ open: boolean }> = ({ open }) => {
  const { register, handleSubmit } = useForm<Inputs>()
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    fetch('/api/build', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
  }

  if (open) {
    return (
      <form
        className="fixed left-14 top-0 z-20 h-screen w-[400px] overflow-y-auto bg-white p-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h1 className="reservoir-h4 mb-14">Design your marketplace</h1>
        <Fieldset>
          <Label htmlFor="name">Name</Label>
          <input
            className="input-primary-outline"
            type="text"
            id="name"
            placeholder="Name your marketplace"
            {...register('name')}
          />
        </Fieldset>

        <Fieldset>
          <Label htmlFor="logo">Logo</Label>
          <input
            className="input-primary-outline"
            type="text"
            id="logo"
            placeholder="Logo URL"
            {...register('logo')}
          />
        </Fieldset>

        <Fieldset>
          <Label htmlFor="theme">Theme</Label>
          <select
            className="input-primary-outline"
            id="theme"
            {...register('theme')}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </Fieldset>

        <Fieldset>
          <Label htmlFor="header-font">Header Font</Label>

          <select
            className="input-primary-outline"
            id="header-font"
            {...register('header-font')}
          >
            <option value="inter">Inter</option>
            <option value="montserrat">Montserrat</option>
            <option value="open-sans">Open Sans</option>
            <option value="playfair-display">Playfair Display</option>
            <option value="roboto">Roboto</option>
          </select>
        </Fieldset>

        <Fieldset>
          <Label htmlFor="body-font">Body Font</Label>
          <select
            className="input-primary-outline"
            id="body-font"
            {...register('body-font')}
          >
            <option value="inter">Inter</option>
            <option value="montserrat">Montserrat</option>
            <option value="open-sans">Open Sans</option>
            <option value="playfair-display">Playfair Display</option>
            <option value="roboto">Roboto</option>
          </select>
        </Fieldset>

        <Fieldset>
          <Label htmlFor="colors">Colors</Label>
          <input
            className="input-primary-outline mb-2"
            type="text"
            id="primary-color"
            placeholder="Primary Color"
            {...register('primary-color')}
          />
          <input
            className="input-primary-outline"
            type="text"
            id="secondary-color"
            placeholder="Secondary Color"
            {...register('secondary-color')}
          />
        </Fieldset>

        <Fieldset>
          <Label htmlFor="marketplace-type">Marketplace Type</Label>
          <select
            className="input-primary-outline"
            id="marketplace-type"
            {...register('marketplace-type')}
          >
            <option value="collection">Collection</option>
            <option value="community">Community</option>
          </select>
        </Fieldset>

        <Fieldset>
          <Label htmlFor="marketplace-fee">Marketplace Fees</Label>
          <input
            className="input-primary-outline mb-2"
            type="text"
            id="marketplace-fee"
            placeholder="% Amount"
            {...register('marketplace-fee')}
          />
          <input
            className="input-primary-outline mb-4"
            type="text"
            id="wallet-address"
            placeholder="Your Wallet Address"
            {...register('wallet-address')}
          />
        </Fieldset>

        <div className="flex gap-3">
          <button className="btn-primary-fill">Save &amp; Preview</button>
          <button className="btn-primary-outline">Publish</button>
        </div>
      </form>
    )
  }

  return null
}

export default BuildMarketplace
