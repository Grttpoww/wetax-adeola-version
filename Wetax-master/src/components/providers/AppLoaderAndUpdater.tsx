import * as React from 'react'
import * as Updates from 'expo-updates'
import { AppLoading } from '../shared/AppLoading'
import { ImageSourcePropType } from 'react-native'

type Props = {
  messages: Array<string>
  image: ImageSourcePropType
  version: string
}

export const AppLoaderAndUpdater = (props: Props) => {
  const [checkedUpdate, setHasCheckedUpdate] = React.useState(false)

  const fetchUpdate = async () => {
    try {
      const { isAvailable } = await Updates.checkForUpdateAsync()
      if (isAvailable) {
        const { isNew } = await Updates.fetchUpdateAsync()
        if (isNew) {
          await Updates.reloadAsync()
          await new Promise(() => {})
        } else {
          setHasCheckedUpdate(true)
        }
      } else {
        setHasCheckedUpdate(true)
      }
    } catch (err) {}
    setHasCheckedUpdate(true)
  }

  React.useEffect(() => {
    fetchUpdate()
  }, [])

  const messages = [...(checkedUpdate ? [] : ['Checking update...']), ...props.messages]

  return <AppLoading messages={messages} image={props.image} version={props.version} />
}
