import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'

const FormField = ({ title, value, placeholder, handleChangeText, otherStyles, ...props }) => {
    const [showPassword, setShowPassword] = useState(false)
    const [isFocused, setIsFocused] = useState(false);
return (
    <View className={`"space-y-2" ${otherStyles}`}>
    <Text className="text-base font-pmedium ml-1 text-gray-500">{title}</Text>
    <View className="border-2 border-gray-200 w-full h-16 px-4 bg-white rounded-2xl focus:border-blue-500 items-center">
        <TextInput 
            className="flex-1 font-psemibold text-base w-full text-black" 
            value={value} 
            placeholder={placeholder} 
            placeholderTextColor="gray"
            onChangeText={handleChangeText}
            secureTextEntry={title === 'Password' && !showPassword}
        />

        {/* {title === 'Password' && (
            <TouchableOpacity onPress={()=> setShowPassword(!showPassword)}>
                
            </TouchableOpacity>   
        )} */}
    </View>
    </View>
)
}

export default FormField