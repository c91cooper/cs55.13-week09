import React, { useState, useEffect } from 'react'
import {
    Flex,
    Heading,
    InputGroup,
    InputLeftElement,
    Input,
    Button,
    Text,
    IconButton,
    Divider,
} from "@chakra-ui/react"
import DarkModeSwitch from '../components/DarkModeSwitch'
import {
    useAuthUser,
    withAuthUser,
    withAuthUserTokenSSR,
    AuthAction,
} from 'next-firebase-auth'
import getAbsoluteURL from '../utils/getAbsoluteURL'
import { AddIcon, DeleteIcon, StarIcon } from "@chakra-ui/icons"
import firebase from 'firebase/app'
import 'firebase/firestore'

const Contacts = () => {
    const AuthUser = useAuthUser()
    const [inputName, setInputName] = useState('')
    const [inputNumber, setInputNumber] = useState('')
    const [contacts, setContacts] = useState([])


    useEffect(() => {
        AuthUser.id &&
            firebase
                .firestore()
                .collection("contacts")
                .where('user', '==', AuthUser.id)
                .onSnapshot(snapshot => {
                    setContacts(snapshot.docs.map(doc => {
                      return{
                        contactID: doc.id,
                        contactName: doc.data().name,
                        contactNumber: doc.data().number
                      }
                })
                    );
                })
    })

    const sendData = () => {
        try {
            firebase
                .firestore()
                .collection("contacts") 
                .add({
                    name: inputName,
                    number: inputNumber,
                    //timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    user: AuthUser.id
                })
                .then(console.log('Data was successfully sent to cloud firestore!'));
                setInputName('');
                setInputNumber('');
        } catch (error) {
            console.log(error)
        }
    }

    const deleteContact = (t) => {
        try {
            firebase
                .firestore()
                .collection("contacts")
                .doc(t)
                .delete()
                .then(console.log('Data was successfully deleted!'))
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <Flex flexDir="column" maxW={800} align="center" justify="center" minH="100vh" m="auto" px={4}>
            <Flex justify="space-between" w="100%" align="center">
                <Heading mb={4}>Welcome, {AuthUser.email}!</Heading>
                <Flex>
                    <DarkModeSwitch />
                    <IconButton ml={2} onClick={AuthUser.signOut} icon={<StarIcon />} />
                </Flex>
            </Flex>

            <InputGroup>
                <InputLeftElement
                    pointerEvents="none"
                    children={<AddIcon color="gray.300" />}
                />
                <Input type="text" value={inputName} onChange={(e) => setInputName(e.target.value)} placeholder="Contact Name" />
                <Input type="text" value={inputNumber} onChange={(e) => setInputNumber(e.target.value)} placeholder="Contact Phone Number" />
                <Button
                    ml={2}
                    onClick={() => sendData()}
                >
                    Add Contact
                </Button>
            </InputGroup>

            {contacts.map((item, i) => {
                return (
                    <React.Fragment key={i}>
                        {i > 0 && <Divider />}
                        <Flex
                            w="100%"
                            p={5}
                            my={2}
                            align="center"
                            borderRadius={5}
                            justifyContent="space-between"
                        >
                            <Flex align="center">
                                <Text fontSize="xl" mr={4}>{i + 1}.</Text>
                                <Text>{item.contactName}</Text>
                                <Text> ... {item.contactNumber}</Text>
                            </Flex>
                            <IconButton onClick={() => deleteContact(item.contactID)} icon={<DeleteIcon />} />
                        </Flex>
                    </React.Fragment>
                )
            })}
        </Flex>
    )
}

export const getServerSideProps = withAuthUserTokenSSR({
    whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser, req }) => {
    return {
        props: {
        }
    }
})

export default withAuthUser({
    whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
    whenUnauthedBeforeInit: AuthAction.REDIRECT_TO_LOGIN,
})(Contacts)
