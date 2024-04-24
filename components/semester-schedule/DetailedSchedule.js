import {
  Badge,
  Box,
  Card,
  CardBody,
  CardHeader,
  Flex,
  HStack,
  Heading,
  IconButton,
  SimpleGrid,
  Text,
  useDisclosure, Tooltip,
} from "@chakra-ui/react";
import { useState } from "react";
import { MdSwapHoriz, MdClose } from "react-icons/md";
import DayBadge from "../common/DayBadge";
import SectionSelector from "./SectionSelector";

export default function DetailedSchedule({
  schedule,
  setSchedule,
  setUnsavedChanges,
}) {
  const { isOpen, onOpen, onClose } = useDisclosure(); // section selector modal
  const [sectionToSwap, setSectionToSwap] = useState(null);
  const [courseToSwap, setCourseToSwap] = useState(null);
  const [linkedLabToSwap, setLinkedLabToSwap] = useState(null);

  function swapSection(scheduleCourse) {
    const course = scheduleCourse.course;

    setCourseToSwap(course);
    setSectionToSwap(scheduleCourse.section);

    if (course.linkedLab) {
      if (course.type == "LB") {
        const lectureScheduleCourse = schedule.find(
          (s) => s.course.code == course.code && s.course.type == "LC"
        );
        setSectionToSwap(lectureScheduleCourse.section);
        setCourseToSwap(lectureScheduleCourse.course);
      }

      setLinkedLabToSwap(
        schedule.find(
          (s) => s.course.code == course.code && s.course.type == "LB"
        ).section
      );
    } else setLinkedLabToSwap(null);
    onOpen();
  }

  function removeSelectedSection(scheduleCourse) {
    setSchedule((prev) => {
      const temp = JSON.parse(JSON.stringify(prev));
      const scheduleCourseIndex = temp.findIndex(
        (s) => s.course.id == scheduleCourse.course.id
      );

      if (temp[scheduleCourseIndex].section) {
        temp[scheduleCourseIndex] = { ...scheduleCourse, section: null };
        setUnsavedChanges.on();
      }

      return temp;
    });
  }

  const textStyle = { fontFamily: "sans-serif", fontWeight: "bold", color: "gray.600", fontSize: "xs" }

  return (
    <SimpleGrid
      columns={2}
      spacing={5}
      py={5}
      minChildWidth={"250px"}
      overflow={"auto"}
      height={"100%"}
      alignItems="center"
      justifyItems="center"
    >
      {schedule.map((scheduleCourse) => (
        <Card
          key={scheduleCourse.course.id}
          variant="outline"
          size="md"
          width="90%"
          p={1}
          sx={{
            bgColor: "rgba(165, 203, 255, 0.05)",
            filter: "drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))",
            borderRadius: "8px",
            border: "1px solid #D0D8E2",
          }}
        >
          <CardHeader py={1}>
            <HStack justifyContent={"space-between"} py={1}>
              <HStack>
                {scheduleCourse.section && (
                  <Badge variant="subtle" colorScheme={"teal"}>
                    {" "}
                    {scheduleCourse.section.sectionNo}
                  </Badge>
                )}
                {scheduleCourse.course.linkedLab &&
                  scheduleCourse.course.type == "LB" && (
                    <Badge variant="subtle" colorScheme={"teal"}>
                      {" "}
                      Linked Lab
                    </Badge>
                  )}
              </HStack>

              <HStack>
                <Tooltip label='Swap course section'>
                  <IconButton
                    size="xs"
                    variant={"outline"}
                    aria-label="Swap course scheduleCourse"
                    icon={<MdSwapHoriz />}
                    onClick={() => swapSection(scheduleCourse)}
                  />
                </Tooltip>
                <Tooltip label='Remove selected course section'>
                  <IconButton
                    color={"red"}
                    size={"xs"}
                    variant={"outline"}
                    icon={<MdClose />}
                    onClick={() => removeSelectedSection(scheduleCourse)}
                    aria-label='remove section' />
                </Tooltip>
              </HStack>
            </HStack>

            <Heading size="xs" mb={0}>{scheduleCourse.course.title}</Heading>
          </CardHeader>

          <CardBody pt={1} pb={2}>
            {scheduleCourse.section ? (
              <Flex direction="column">
                <Text
                  sx={{ ...textStyle, mb: 0.5 }}
                >
                  Instructor: {scheduleCourse.section.instructor.name}
                </Text>

                <Flex direction={"column"} gap={1}>
                  {scheduleCourse.section.meetingTimes.map((m, index) => (
                    <Flex
                      key={index} wrap={"wrap"}
                      columnGap={2} alignItems={"baseline"}
                    >
                      <DayBadge meetingDays={m.meetingDays} />
                      <Text sx={textStyle}>{`${m.meetingTimeStart} - ${m.meetingTimeEnd}`}</Text>
                      <Text sx={textStyle}>|</Text>
                      <Text sx={textStyle}>{m.room}</Text>
                    </Flex>
                  ))}
                </Flex>
              </Flex>
            ) : (
              <Text fontSize="sm" fontWeight={"semibold"}>
                No section selected
              </Text>
            )}
          </CardBody>
        </Card>
      ))}

      {isOpen && courseToSwap && (
        <SectionSelector
          schedule={schedule}
          setSchedule={setSchedule}
          setUnsavedChanges={setUnsavedChanges}
          course={courseToSwap}
          sectionToSwap={sectionToSwap}
          linkedLabToSwap={linkedLabToSwap}
          isOpen={isOpen}
          onClose={onClose}
        />
      )}
    </SimpleGrid>
  );
}