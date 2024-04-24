import {
    Step,
    Divider,
    StepDescription,
    StepIcon,
    StepIndicator,
    StepNumber,
    StepSeparator,
    StepStatus,
    StepTitle,
    Stepper,
    useSteps,
    Box,
} from '@chakra-ui/react'

export default function SignUpStepper({activeStep}) {

    const steps = [
        {title: 'First', description: 'Sign Up Details'}, {
            title: 'Second',
            description: 'Student Settings'
        }]


    return (
        <Stepper size='lg' colorScheme='facebook' index={activeStep}>
            {steps.map((step, index) => (
                <Step key={index}>
                    <StepIndicator>
                        <StepStatus
                            complete={<StepIcon/>}
                            incomplete={<StepNumber/>}
                            active={<StepNumber/>}
                        />
                    </StepIndicator>

                    <Box flexShrink='0'>
                        <StepTitle>{step.title}</StepTitle>
                        <StepDescription>{step.description}</StepDescription>
                    </Box>
                    <Divider/>
                    <StepSeparator/>
                </Step>
            ))}
        </Stepper>
    )

}