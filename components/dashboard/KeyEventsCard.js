import { Text, Heading, Card, CardHeader, CardBody } from '@chakra-ui/react'

export default function KeyEventsCard({ children }) {

    return (
        <Card size='md' align='center' sx={{bgColor: 'gray.50'}}>
            <CardHeader pb={2}>
                <Heading size='md'>Key Events</Heading>
            </CardHeader>

            <CardBody pt={2}>
                <Text>Registration Start - 01/01/2023</Text>
                <Text>Add/Drop - 25/01/2023</Text>
            </CardBody>
        </Card>
    )
}