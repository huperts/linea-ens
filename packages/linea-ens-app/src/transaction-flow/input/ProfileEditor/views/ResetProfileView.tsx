import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components'

import { Button, Dialog } from '@ensdomains/thorin'

import { CenteredTypography } from '../components/CenteredTypography'
import { ContentContainer } from '../components/ContentContainer'
import { StyledInnerDialog } from '../components/StyledInnerDialog'

type Props = {
  onBack: () => void
  onNext: () => void
}
export const ResetProfileView = ({ onNext, onBack }: Props) => {
  const theme = useTheme()
  const { t } = useTranslation('transactionFlow')
  return (
    <>
      <Dialog.Heading
        title={t('input.profileEditor.warningOverlay.resetProfile.title')}
        alert="warning"
      />
      <StyledInnerDialog>
        <ContentContainer>
          <CenteredTypography>
            {t('input.profileEditor.warningOverlay.resetProfile.subtitle')}
          </CenteredTypography>
        </ContentContainer>
      </StyledInnerDialog>
      <Dialog.Footer
        leading={
          <Button
            style={{
              backgroundColor: theme.colors.backgroundSecondary,
              color: theme.colors.textSecondary,
            }}
            onClick={onBack}
            data-testid="warning-overlay-back-button"
          >
            {t('action.back', { ns: 'common' })}
          </Button>
        }
        trailing={
          <Button onClick={onNext} data-testid="warning-overlay-next-button">
            {t('action.understand', { ns: 'common' })}
          </Button>
        }
      />
    </>
  )
}
