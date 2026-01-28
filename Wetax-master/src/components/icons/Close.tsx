import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

export type Props = { color?: string; backgroundColor?: string }
export const Close = (props: Props) => {
  return (
    <Svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M15 30C23.2843 30 30 23.2843 30 15C30 6.71573 23.2843 0 15 0C6.71573 0 0 6.71573 0 15C0 23.2843 6.71573 30 15 30Z"
        fill={props.backgroundColor || 'black'}
      />
      <Path
        d="M10 10L19.5 19.5"
        stroke={props.color || 'white'}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M10 19.5L19.5 10"
        stroke={props.color || 'white'}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  )
}
