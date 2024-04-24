import { DragHandleIcon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Button,
  Card,
  CardHeader,
  Collapse,
  Divider,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Select,
  VStack,
  useToast,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useStore } from "stores/store";
import { getCookie } from "../../pages/api/util/getCookie";

export default function AddCourseModal({ isOpen, onClose }) {
  const toast = useToast();

  const [queryResults, setQueryResults] = useState(false);
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [packages, setPackages] = useState([]);
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const {
    isOpen: isOpenAdvOptions,
    onToggle: onToggleAdvOptions,
    onClose: onCloseAdvOptions,
  } = useDisclosure();
  const { userToken } = getCookie({}, "userSession");

  useEffect(() => {
    fetch(`/api/packages`, {
      headers: { Authorization: `bearer ${userToken}` },
    })
      .then((res) => res.json())
      .then((data) => setPackages(data));
  }, []);

  function modalOnClose() {
    setCourseCode("");
    setCourseName("");
    setSelectedPackageId("");
    setQueryResults(false);
    onCloseAdvOptions();
    onClose();
  }

  const setCourseToAdd = useStore((state) => state.setCourseToAdd);

  function onDragStart(course) {
    setCourseToAdd(course);
    modalOnClose();
    toast({
      title: "Drag mode activated",
      description: "Drop the course into a semester",
      variant: "subtle",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  }

  async function handleSearch() {
    let param = "";
    if (courseCode) param = `code=${courseCode}`;
    else if (courseName) param = `title=${courseName}`;
    else if (selectedPackageId) param = `packageId=${selectedPackageId}`;

    const res = await fetch(`/api/courses?${param}`, {
      headers: { Authorization: `bearer ${userToken}` },
    });
    const data = await res.json();
    onCloseAdvOptions();
    setQueryResults(data);
  }

  return (
    <Box>
      <Modal isOpen={isOpen} onClose={modalOnClose} isCentered size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Course</ModalHeader>
          <ModalCloseButton />
          <ModalBody mb="5%">
            <FormControl>
              <FormLabel>Course Code</FormLabel>
              <Input
                type="text"
                value={courseCode}
                onChange={(e) => {
                  setCourseName("");
                  setSelectedPackageId("");
                  setCourseCode(e.target.value);
                }}
              />
            </FormControl>

            <Box>
              <Button
                onClick={onToggleAdvOptions}
                height={"fit-content"}
                p={1}
                mt={2}
              >
                Advanced options
              </Button>
              <Collapse in={isOpenAdvOptions}>
                <Box>
                  <FormControl>
                    <FormLabel>Course Name</FormLabel>
                    <Input
                      type="text"
                      placeholder="Course name"
                      value={courseName}
                      onChange={(e) => {
                        setCourseCode("");
                        setSelectedPackageId("");
                        setCourseName(e.target.value);
                      }}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Package</FormLabel>
                    <Select
                      placeholder="Select Package"
                      value={selectedPackageId}
                      onChange={(e) => {
                        setCourseCode("");
                        setCourseName("");
                        setSelectedPackageId(parseInt(e.target.value));
                      }}
                    >
                      {packages.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Collapse>
            </Box>

            <Button mt={2} width={"100%"} onClick={handleSearch}>
              Search
            </Button>

            {queryResults && (
              <Box p={2}>
                <Divider />
                <VStack
                  spacing={3}
                  mt={2}
                  maxHeight={"50vh"}
                  overflowY={"scroll"}
                >
                  {queryResults.map((course, index) => {
                    if (course.linkedLab && course.type == "LB") return null;
                    else
                      return (
                        <CourseCard
                          key={course.id}
                          course={course}
                          onDragStart={onDragStart}
                        />
                      );
                  })}
                </VStack>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export function CourseCard({ course, onDragStart }) {
  return (
    <Card
      variant="outline"
      size="sm"
      width="100%"
      height="auto"
      px={2}
      draggable
      onDragStart={() => onDragStart(course)}
      _hover={{ cursor: "grab" }}
      sx={{
        bgColor: "rgba(165, 203, 255, 0.05)",
        filter: "drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))",
        borderRadius: "8px",
        border: "1px solid #D0D8E2",
      }}
    >
      <HStack>
        <DragHandleIcon boxSize={4} />
        <VStack px={2} alignItems="flex-start">
          <HStack py={2} alignItems="flex-start">
            <Badge variant="solid" colorScheme={"teal"}>
              {course.creditHours} Credit Hours
            </Badge>
            {course.creditHours !== 0 && course.linkedLab === true ? (
              <Badge variant="solid" colorScheme={"teal"}>
                Has Linked Lab
              </Badge>
            ) : (
              ""
            )}
            {course.type === "LL" || course.type === "LB" ? (
              <Badge variant="solid" colorScheme={"teal"}>
                Is Lab
              </Badge>
            ) : (
              ""
            )}
            <Badge variant="solid" colorScheme={"teal"}>
              {course.availableTerms === "F"
                ? "Fall Only"
                : course.availableTerms === "S"
                ? "Spring Only"
                : "Fall/Spring"}
            </Badge>
          </HStack>

          <CardHeader pt={1} mb={2} px={0}>
            <Heading size="sm">
              {course.title} - {course.code}
            </Heading>
          </CardHeader>
        </VStack>
      </HStack>
    </Card>
  );
}