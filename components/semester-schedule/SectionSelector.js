import {
  Badge,
  Box,
  Button,
  Card,
  Center,
  Flex,
  HStack,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { checkSectionConflict } from "utils/common";
import DayBadge from "../common/DayBadge";
import { getCookie } from "../../pages/api/util/getCookie";

export default function SectionSelector({
  schedule,
  setSchedule,
  setUnsavedChanges,
  course,
  sectionToSwap,
  linkedLabToSwap,
  isOpen,
  onClose,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState(sectionToSwap);
  const [selectedLab, setSelectedLab] = useState(
    linkedLabToSwap ? linkedLabToSwap : null
  );
  const { userToken } = getCookie({}, "userSession");

  const semId = 201910;
  const campus = "m";

  const [sections, setSections] = useState([]);
  const [linkedLabSections, setLinkedLabSections] = useState([]);

  useEffect(() => {
    setIsLoading(true);
    setSelectedSection(sectionToSwap);

    fetch(
      `/api/semester-schedule/${semId}/sections/${course.code}?campus=${campus}`,
      { headers: { Authorization: `bearer ${userToken}` } }
    )
      .then((res) => res.json())
      .then((data) => {
        if (course.linkedLab) {
          const tempLecSections = [];
          const tempLinkedLabSections = [];
          for (const section of data) {
            if (section.course.type == "LB")
              tempLinkedLabSections.push(section);
            else tempLecSections.push(section);
          }
          setSections(tempLecSections);
          setLinkedLabSections(tempLinkedLabSections);
        } else setSections(data);
        setIsLoading(false);
      });
  }, [sectionToSwap, linkedLabToSwap, course]);

  const toast = useToast();

  function handleConfirm() {
    if (
      (!sectionToSwap && !selectedSection) ||
      (sectionToSwap && sectionToSwap.id == selectedSection.id)
    ) {
      if (
        (!linkedLabToSwap && !selectedLab) ||
        (linkedLabToSwap && linkedLabToSwap.id == selectedLab.id)
      )
        return onClose();
    }

    setSchedule((prev) => {
      const temp = JSON.parse(JSON.stringify(prev));

      const scheduleCourseIndex = temp.findIndex(
        (s) => s.course.id == course.id
      );
      const updatedScheduleCourse = {
        ...temp[scheduleCourseIndex],
        section: selectedSection,
      };
      temp[scheduleCourseIndex] = updatedScheduleCourse;

      if (course.linkedLab) {
        const scheduleCourseIndex = temp.findIndex(
          (s) => s.course.code == course.code && s.course.type == "LB"
        );
        const updatedScheduleCourse = {
          ...temp[scheduleCourseIndex],
          section: selectedLab,
        };
        temp[scheduleCourseIndex] = updatedScheduleCourse;
      }

      return temp;
    });

    toast({
      title: "Section updated",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
    setUnsavedChanges.on();
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />

      <ModalContent>
        <ModalHeader>
          {course.title} - {course.code}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column" maxH="70vh">
            {isLoading ? (
              <Center h="100%" color="white">
                <Spinner
                  thickness="3px"
                  speed="0.65s"
                  emptyColor="gray.200"
                  color="orange.500"
                  size="lg"
                />
              </Center>
            ) : (
              <Flex
                px={5}
                py={2.5}
                gap={5}
                direction="column"
                sx={{
                  height: "100%",
                  bgColor: "rgba(245, 245, 245, 0.6)",
                  overflowY: "auto",
                }}
              >
                {sections.map((section) => (
                  <SectionCard
                    key={section.id}
                    section={section}
                    schedule={schedule}
                    selectedSection={selectedSection}
                    selectedLab={selectedLab}
                    onSelect={() => setSelectedSection(section)}
                  />
                ))}

                {course.linkedLab && (
                  <>
                    Labs
                    {linkedLabSections.map((section) => (
                      <SectionCard
                        key={section.id}
                        section={section}
                        schedule={schedule}
                        selectedSection={selectedSection}
                        selectedLab={selectedLab}
                        onSelect={() => setSelectedLab(section)}
                      />
                    ))}
                  </>
                )}
              </Flex>
            )}
          </Flex>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleConfirm}>
            Confirm
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function SectionCard({
  section,
  schedule,
  selectedSection,
  selectedLab,
  onSelect,
}) {
  const cardStyle = {
    bgColor: "rgba(165, 203, 255, 0.06)",
    stroke: "rgba(165, 203, 255, 0.4)",
  };

  const currentlySelected =
    (selectedSection && section.id == selectedSection.id) ||
    (selectedLab && section.id == selectedLab.id);

  if (currentlySelected) {
    cardStyle.borderColor = "rgba(165, 203, 255, 1)";
    cardStyle.borderWidth = "2px";
  }

  const conflicts = schedule.some(
    (s) => s.section && s.section.courseId != section.courseId && checkSectionConflict(section, s.section)
  );

  const availableSeats = section.seatsTotal - section.seatsCurrent

  return (
    <Box>
      <Card
        variant="outline"
        size="md"
        px={5}
        py={0.5}
        pt={3}
        height="auto"
        sx={cardStyle}
        cursor={conflicts ? "not-allowed" : "pointer"}
        _hover={conflicts ? {} : { bgColor: "rgba(0, 94, 255, 0.2)" }}
        onClick={conflicts ? () => { } : onSelect}
        title={conflicts ? "Time Conflict" : ""}
      >
        <Flex direction="column" opacity={conflicts ? 0.5 : 1}>
          <HStack alignItems={"baseline"}>
            <Badge fontSize={'0.6em'} colorScheme={availableSeats > 0 ? "green" : "red"}>
              Seats free: {availableSeats}/{section.seatsTotal}
            </Badge>
            {conflicts && <Badge colorScheme="red" fontSize='0.6em'>Time Conflict</Badge>}
          </HStack>

          <HStack alignItems={"baseline"}>
            <Heading fontWeight="bold" fontSize="md">
              Section {section.sectionNo}
            </Heading>
            <Text fontFamily={"sans-serif"} fontSize="sm">
              {section.instructor.name}
            </Text>
          </HStack>

          <Flex direction={"column"} gap={1}>
            {section.meetingTimes.map((m, index) => (
              <Flex
                key={index}
                gap={3}
                alignItems={"baseline"}
                fontFamily={"sans-serif"}
                as="b"
                color="gray.600"
                fontSize="xs"
              >
                <DayBadge meetingDays={m.meetingDays} />
                <Text>{`${m.meetingTimeStart} - ${m.meetingTimeEnd}`}</Text>
                <Text>|</Text>
                <Text>{m.room}</Text>
              </Flex>
            ))}
          </Flex>
        </Flex>
      </Card>
    </Box>
  );
}
