import { useTranslation } from 'react-i18next'

import { Card, Helper } from '@ensdomains/thorin'

import { RecordItem } from '@app/components/@atoms/RecordItem/RecordItem'
import { useChainName } from '@app/hooks/chain/useChainName'
import { useContractAddress } from '@app/hooks/chain/useContractAddress'
import type { useNameDetails } from '@app/hooks/useNameDetails'
import { useBreakpoint } from '@app/utils/BreakpointProvider'
import { makeEtherscanLink } from '@app/utils/utils'

import { Header } from './components/Header'

type Props = {
  details: ReturnType<typeof useNameDetails>
}

export const ContractSection = ({ details }: Props) => {
  const { t } = useTranslation('profile')
  const address = useContractAddress({ contract: 'ensNameWrapper' })
  const chainName = useChainName()
  const breakpoint = useBreakpoint()

  const { isLoading } = details

  if (!details.isWrapped || isLoading) return null
  return (
    <Card>
      <Header />
      <RecordItem as="a" value={address} link={makeEtherscanLink(address, chainName, 'address')}>
        {address}
      </RecordItem>
      <Helper type="info" alignment={breakpoint.sm ? 'horizontal' : 'vertical'}>
        {t('tabs.ownership.sections.contract.warning')}
      </Helper>
    </Card>
  )
}
