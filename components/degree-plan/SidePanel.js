import { Box, Divider, Flex, Icon, IconButton, Image, Text, Tooltip } from '@chakra-ui/react';
import { AiOutlinePlusSquare } from "react-icons/ai";
import { MdStar } from "react-icons/md";

export default function SidePanel({ plans, currentPlanHasChanges, setShowUnsavedAlert, selectedPlan, sidePanelSelectPlan, triggerGenerate }) {
    const maxPlanCount = 3

    return (
        <>
            <Flex gap={5}>
                <Flex gap={5} direction='column' justify='center' as='b' height='80vh' width={"50px"}>
                    {
                        plans.map((plan, index) => {
                            return (
                                <Box
                                    key={plan.id}
                                    _hover={{ "cursor": "pointer" }}
                                    onClick={() => {
                                        currentPlanHasChanges ?
                                            setShowUnsavedAlert.on() :
                                            sidePanelSelectPlan(plans[index])
                                    }}
                                    position="relative"
                                    sx={{
                                        transform: plan.id === selectedPlan.id ? 'scale(1.2)' : 'scale(1)',
                                        transition: 'transform 0.2s ease-in-out'
                                    }}
                                >
                                    {plan.mainPlan && (
                                        <Box
                                            position='absolute'
                                            top='0' right='0' zIndex='1'
                                            backgroundColor='white'
                                            borderRadius='50%'
                                            padding='1' boxSize={5}
                                        >
                                            <Icon
                                                position='absolute'
                                                top='0' right='0' zIndex='1'
                                                as={MdStar} color='yellow.400'
                                            />
                                        </Box>
                                    )}

                                    <Flex direction='column' align='center'>
                                        <Image
                                            boxSize='50px'
                                            objectFit='cover'
                                            src='https://thumbs.dreamstime.com/b/syllabus-rgb-color-icon-university-courses-list-educational-plan-programs-life-activities-academic-transcript-study-schedule-191325738.jpg'
                                            alt='Plan icon' />

                                        <Text
                                            fontSize={'xs'}
                                            textAlign={'center'}
                                            sx={{ fontWeight: plan.id === selectedPlan.id ? 'bold' : 'normal' }}
                                        >
                                            {plan.name}
                                        </Text>
                                    </Flex>
                                </Box>
                            )
                        })
                    }
                    <Flex justify='center'>
                        <Tooltip isDisabled={plans.length < maxPlanCount} label='Max plan count reached'>
                            <IconButton
                                onClick={() => {
                                    currentPlanHasChanges ?
                                        setShowUnsavedAlert.on()
                                        : triggerGenerate()
                                }}
                                isDisabled={plans.length >= maxPlanCount}
                                icon={<AiOutlinePlusSquare />}
                            />
                        </Tooltip>
                    </Flex>
                </Flex>
                <Divider orientation='vertical' />
            </Flex>
        </>
    )
}