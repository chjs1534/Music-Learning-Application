import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import FormField from '../../components/FormField'
import Button from '../../components/Button'
import { router } from 'expo-router'
import { AuthenticationDetails, CognitoUser, CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import { poolData } from '../config/poolData';

const UserPool = new CognitoUserPool(poolData);

export const authenticate = (Email, Password) => {
  return new Promise((resolve, reject) => {

    const user = new CognitoUser({
      Username: Email,
      Pool: UserPool
    });

    const authDetails = new AuthenticationDetails({
      Username: Email,
      Password
    });

    user.authenticateUser(authDetails, {
      onSuccess: (result) => {
        console.log("login successful");
        resolve(result);
      },
      onFailure: (err) => {
        console.log("login failed", err);
        reject(err);
      }
    });
  });
};

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false)

  // console.log(USERPOOL_ID)
  // console.log(CLIENT_ID)

  const login = async () => {
    // Input error checking
    setIsSubmitting(true);
    if (username.length <= 3) {
      alert("Username must be longer than 3 characters");
      return;
    }
    if (password.length < 8) {
      alert("Password must be longer than 8 characters");
      return;
    }
    const authResult = await authenticate(username, password);

    authenticate(username, password)
    .then((data) => {
      new Promise(function fetchCurrentAuthToken(resolve, reject) {
        var cognitoUser = UserPool.getCurrentUser();
        if (cognitoUser) {
          cognitoUser.getSession(function sessionCallback(err, session) {
            if (err) {
              reject(err);
            } else if (!session.isValid()) {
              resolve(null);
            } else {
              resolve(session.getIdToken().getJwtToken());
            }
          });
        } else {
          resolve(null);
        }
      })
      .then((authToken :string) => 
        {console.log(authToken); 
          const jwtPayload = JSON.parse(atob(authToken.split('.')[1]));
          let userId = jwtPayload.sub;
          console.log(userId)
        router.replace({ pathname: '/Home', params: { authToken, userId } })
      })
    })
    .catch((err) => {
      alert(err);
      console.log(err);
      // wrong account details
    });

    setIsSubmitting(false);
  }

  // add delay with splash maybe
  // make an option to show password

  return (
    <SafeAreaView className="h-full bg-black">
      <ScrollView>
        <View className="w-full justify-center min-h-[85vh] px-4 my-6">
          <Text className="text-4xl font-semibold text-white">Log in to Mewsic</Text>
          <FormField 
            title="Username"
            value={username}
            handleChangeText={(e) => setUsername(e)}
            otherStyles="mt-7"
            placeholder="Your username"
          />
          <FormField 
            title="Password"
            value={password}
            handleChangeText={(e) => setPassword(e)}
            otherStyles="mt-7"
            placeholder="Your password"
          />
          <Button
            title="Login"
            handlePress={login}
            containerStyles="mt-10 bg-white"
            isLoading={isSubmitting}
            textStyles="text-lg font-semibold"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Login
