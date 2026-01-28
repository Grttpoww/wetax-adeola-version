// import { MaterialIcons } from '@expo/vector-icons'
// import * as React from 'react'
// import { Platform, Text, View } from 'react-native'
// import Picker from 'react-native-picker-select'
// import styled from 'styled-components'
// import { Theme, getThemeContext } from '../theme/theme'
// import { createGetStyle } from './helpers'

// const SelectButtonWrapper = styled(View)``

// const SelectButton = styled(View)`
//   width: 100%;
//   height: 56px;
//   background-color: #f0f0f0;
//   border-radius: 2px;
//   align-items: center;
//   padding: 0 16px 0 16px;
//   flex-direction: row;
// `

// const SelectButtonText = styled(Text)`
//   color: black;
//   font-weight: 600;
//   font-size: 16px;
// `

// const Label = styled(Text)`
//   color: white;
//   font-size: 14px;
//   padding-left: 8px;
//   height: 18px;
//   font-weight: 600;
//   opacity: 1;
//   margin-bottom: 8px;
// `

// export type Props = {
//   items: Array<{ label: string | string; value: string }>
//   value?: string
//   onChange: (v: string) => void
//   label?: string
//   defaultLabel?: string
//   style?: Partial<Theme['select']>
//   placeholder?: string
//   disabled?: boolean
// }

// export const Select = (props: Props) => {
//   const [internalValue, setInternalValue] = React.useState<any>(props.value)
//   const theme = React.useContext(getThemeContext())
//   const getStyle = createGetStyle(theme, 'select')(props.style)

//   return (
//     <Picker
//       disabled={props.disabled}
//       onValueChange={(v) => {
//         setInternalValue(v)
//         if (Platform.OS !== 'ios') {
//           if (v !== null || props.placeholder !== undefined) {
//             props.onChange(v)
//           }
//         }
//       }}
//       value={internalValue}
//       items={props.items.map((i) => ({
//         label: i.label,
//         value: i.value,
//       }))}
//       placeholder={{
//         label: props.placeholder ? props.placeholder : '',
//         value: null,
//       }}
//       useNativeAndroidPickerStyle
//       onDonePress={() => {
//         if (internalValue !== null || props.placeholder !== undefined) {
//           props.onChange(internalValue)
//         }
//       }}
//     >
//       <SelectButtonWrapper style={getStyle('wrapper')}>
//         {props.label !== undefined ? <Label style={getStyle('label')}>{props.label}</Label> : null}
//         <SelectButton style={getStyle('button')}>
//           <MaterialIcons name="keyboard-arrow-down" size={22} style={[...getStyle('icon')]} />
//           <SelectButtonText style={getStyle('buttonLabel')}>
//             {props.items.find((i) => i.value === props.value)?.label.toString()}
//           </SelectButtonText>
//         </SelectButton>
//       </SelectButtonWrapper>
//     </Picker>
//   )
// }

// import { MaterialIcons } from '@expo/vector-icons'
// import React, { useState } from 'react'
// import { Modal, Platform, Text, TouchableOpacity, View, FlatList, Pressable } from 'react-native'
// import styled from 'styled-components/native'
// import { Theme, getThemeContext } from '../theme/theme'
// import { createGetStyle } from './helpers'

// const SelectButtonWrapper = styled(View)``

// const SelectButton = styled(View)`
//   width: 100%;
//   height: 56px;
//   background-color: #f0f0f0;
//   border-radius: 3px;
//   align-items: center;
//   padding: 0 16px;
//   flex-direction: row;
//   justify-content: space-between;
//   border-radius: 10px;
//   border: #4d4d4f solid 1px;
// `

// const SelectButtonText = styled(Text)`
//   color: black;
//   font-weight: 600;
//   font-size: 16px;
// `

// const Label = styled(Text)`
//   color: white;
//   font-size: 14px;
//   padding-left: 8px;
//   height: 18px;
//   font-weight: 600;
//   opacity: 1;
//   margin-bottom: 8px;
// `

// const ModalContainer = styled(View)`
//   flex: 1;
//   justify-content: flex-end;
//   background-color: rgba(0, 0, 0, 0.3);
// `

// const ModalContent = styled(View)`
//   background-color: white;
//   padding: 16px;
//   border-top-left-radius: 12px;
//   border-top-right-radius: 12px;
//   max-height: 50%;
// `

// const ModalItem = styled(TouchableOpacity)`
//   padding: 16px;
//   border-bottom-width: 1px;
//   border-bottom-color: #ccc;
// `

// const ModalItemText = styled(Text)`
//   font-size: 16px;
// `

// export type Props = {
//   items: Array<{ label: string; value: string }>
//   value?: string
//   onChange: (v: string) => void
//   label?: string
//   defaultLabel?: string
//   style?: Partial<Theme['select']>
//   placeholder?: string
//   disabled?: boolean
// }

// export const Select = (props: Props) => {
//   const [isModalVisible, setIsModalVisible] = useState(false)
//   const [internalValue, setInternalValue] = useState<string | undefined>(props.value)
//   const theme = React.useContext(getThemeContext())
//   const getStyle = createGetStyle(theme, 'select')(props.style)

//   const handleSelect = (value: string) => {
//     setInternalValue(value)
//     setIsModalVisible(false)
//     props.onChange(value)
//   }

//   const selectedLabel =
//     props.items.find((item) => item.value === props.value)?.label ?? props.placeholder ?? 'Select'

//   return (
//     <>
//       <SelectButtonWrapper style={getStyle('wrapper')}>
//         {props.label && <Label style={getStyle('label')}>{props.label}</Label>}
//         <Pressable
//           onPress={() => {
//             if (!props.disabled) setIsModalVisible(true)
//           }}
//         >
//           <SelectButton style={getStyle('button')}>
//             <SelectButtonText style={getStyle('buttonLabel')}>{selectedLabel}</SelectButtonText>
//             <MaterialIcons name="keyboard-arrow-down" size={22} style={[...getStyle('icon')]} />
//           </SelectButton>
//         </Pressable>
//       </SelectButtonWrapper>

//       <Modal
//         animationType="slide"
//         transparent
//         visible={isModalVisible}
//         onRequestClose={() => setIsModalVisible(false)}
//       >
//         <ModalContainer>
//           <Pressable style={{ flex: 1 }} onPress={() => setIsModalVisible(false)} />
//           <ModalContent>
//             <FlatList
//               data={props.items}
//               keyExtractor={(item) => item.value}
//               renderItem={({ item }) => (
//                 <ModalItem onPress={() => handleSelect(item.value)}>
//                   <ModalItemText>{item.label}</ModalItemText>
//                 </ModalItem>
//               )}
//             />
//           </ModalContent>
//         </ModalContainer>
//       </Modal>
//     </>
//   )
// }

import { MaterialIcons } from '@expo/vector-icons'
import React, { useState } from 'react'
import { Modal, Text, TouchableOpacity, View, FlatList, Pressable, TextInput } from 'react-native'
import styled from 'styled-components/native'
import { Theme, getThemeContext } from '../theme/theme'
import { createGetStyle } from './helpers'

const SelectButtonWrapper = styled(View)``

const SelectButton = styled(View)`
  width: 100%;
  height: 56px;
  background-color: #f0f0f0;
  border-radius: 10px;
  align-items: center;
  padding: 0 16px;
  flex-direction: row;
  justify-content: space-between;
  border: #4d4d4f solid 1px;
`

const SelectButtonText = styled(Text)`
  color: black;
  font-weight: 600;
  font-size: 16px;
`

const Label = styled(Text)`
  color: white;
  font-size: 14px;
  padding-left: 8px;
  height: 18px;
  font-weight: 600;
  opacity: 1;
  margin-bottom: 8px;
`

const ModalContainer = styled(View)`
  flex: 1;
  justify-content: flex-end;
  background-color: rgba(0, 0, 0, 0.3);
`

const ModalContent = styled(View)`
  background-color: white;
  padding: 16px;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  max-height: 70%;
`

const ModalHeader = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`

const ModalTitle = styled(Text)`
  font-size: 18px;
  font-weight: bold;
`

const CancelButton = styled(TouchableOpacity)`
  padding: 4px 8px;
`

const CancelText = styled(Text)`
  color: #007aff;
  font-size: 16px;
`

const SearchInput = styled(TextInput)`
  height: 40px;
  border-width: 1px;
  border-color: #ccc;
  border-radius: 8px;
  padding: 0 10px;
  margin-bottom: 12px;
`

const ModalItem = styled(TouchableOpacity)`
  padding: 16px;
  border-bottom-width: 1px;
  border-bottom-color: #eee;
`

const ModalItemText = styled(Text)`
  font-size: 16px;
`

export type Props = {
  items: Array<{ label: string; value: string }>
  value?: string
  onChange: (v: string) => void
  label?: string
  defaultLabel?: string
  style?: Partial<Theme['select']>
  placeholder?: string
  disabled?: boolean
  modalTitle?: string
}

export const Select = (props: Props) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [internalValue, setInternalValue] = useState<string | undefined>(props.value)
  const [searchText, setSearchText] = useState('')
  const theme = React.useContext(getThemeContext())
  const getStyle = createGetStyle(theme, 'select')(props.style)

  const handleSelect = (value: string) => {
    setInternalValue(value)
    setIsModalVisible(false)
    props.onChange(value)
    setSearchText('')
  }

  const selectedLabel =
    props.items.find((item) => item.value === props.value)?.label ?? props.placeholder ?? 'Select'

  const filteredItems = props.items.filter((item) =>
    item.label.toLowerCase().includes(searchText.toLowerCase()),
  )

  return (
    <>
      <SelectButtonWrapper style={getStyle('wrapper')}>
        {props.label && <Label style={getStyle('label')}>{props.label}</Label>}
        <Pressable
          onPress={() => {
            if (!props.disabled) setIsModalVisible(true)
          }}
        >
          <SelectButton style={getStyle('button')}>
            <SelectButtonText style={getStyle('buttonLabel')}>{selectedLabel}</SelectButtonText>
            <MaterialIcons name="keyboard-arrow-down" size={22} style={[...getStyle('icon')]} />
          </SelectButton>
        </Pressable>
      </SelectButtonWrapper>

      <Modal
        animationType="slide"
        transparent
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <ModalContainer>
          <Pressable style={{ flex: 1 }} onPress={() => setIsModalVisible(false)} />
          <ModalContent>
            <ModalHeader>
              <ModalTitle>{props.modalTitle || 'Select Option'}</ModalTitle>
              <CancelButton onPress={() => setIsModalVisible(false)}>
                <CancelText>Cancel</CancelText>
              </CancelButton>
            </ModalHeader>

            <SearchInput placeholder="Search..." value={searchText} onChangeText={setSearchText} />

            <FlatList
              data={filteredItems}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <ModalItem onPress={() => handleSelect(item.value)}>
                  <ModalItemText>{item.label}</ModalItemText>
                </ModalItem>
              )}
              ListEmptyComponent={<Text style={{ padding: 16 }}>No results found.</Text>}
            />
          </ModalContent>
        </ModalContainer>
      </Modal>
    </>
  )
}
