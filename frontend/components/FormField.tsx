import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'

const FormField = ({ title, value, placeholder, handleChangeText, otherStyles, ...props }) => {
    const [showPassword, setShowPassword] = useState(false)
return (
    <View className={`"space-y-2" ${otherStyles}`}>
    <Text className="text-base font-pmedium">{title}</Text>
    <View className="border-2 border-red-500 w-full h-16 px-4 bg-black-100 rounded-2xl focus:border-black-500 items-center">
        <TextInput 
            className="flex-1 font-psemibold text-base" 
            value={value} placeholder={placeholder} 
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