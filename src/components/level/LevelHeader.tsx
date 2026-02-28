


// import { Text } from "react-native";
// import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

// export function LevelHeader() {
  
//   return (
//     <Animated.View
//       entering={FadeInUp.delay(200)}
//       className="px-4 py-2 justify-center items-center mt-8"
//       style={{ backgroundColor: theme.background}}
//     >
//       <Text className="font-bold text-2xl" style={{ color: theme.text , fontSize: 18, marginTop: 14}}>
//         {formattedLevel}
//         {levelType && levelType !== "home" ? ` ${levelType}` : ""}
//       </Text>
//     </Animated.View>
//   );
// }

import { View, Text } from 'react-native'
import React from 'react'

export default function LevelHeader() {
  return (
    <View>
      <Text>LevelHeader</Text>
    </View>
  )
}
