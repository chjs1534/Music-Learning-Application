import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import NavBar from './NavBar'

const Students = () => {
    return (
        <div className="homepage">
          <div className="profile">
            <NavBar />
            students {':)'}
          </div>
        </div>
      )
}

export default Students

const styles = StyleSheet.create({})