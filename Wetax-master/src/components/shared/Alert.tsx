import { Alert } from 'react-native'

type Props = {
  question: string
  onPress: () => void
  confirmation?: boolean
}

export const createAlert = (props: Props) =>
  Alert.alert(
    props.question,
    '',
    props.confirmation
      ? [
          {
            text: 'okay',
            onPress: props.onPress,
          },
        ]
      : [
          {
            text: 'No',
            style: 'cancel',
          },
          {
            text: 'Yes',
            onPress: props.onPress,
          },
        ],
  )
