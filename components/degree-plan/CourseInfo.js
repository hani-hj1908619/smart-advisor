import {
  Center,
  Divider,
  Flex,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { getCookie } from "../../pages/api/util/getCookie";

export default function CourseInfo({ selectedPlanCourse, isOpen, onClose }) {
  const [dbCourse, setDbCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { userToken } = getCookie({}, "userSession");

  useEffect(() => {
    setIsLoading(true);
    fetch(`./api/courses?courseId=${selectedPlanCourse.course.id}`, {
      headers: { Authorization: `bearer ${userToken}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setDbCourse(data);
        setIsLoading(false);
      });
  }, [selectedPlanCourse]);

  const width = "8rem";

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered>
      <ModalOverlay />
      <ModalContent p={5} maxH={"85%"}>
        <ModalHeader>
          Course Information
          <Divider />
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody overflowY={"scroll"}>
          {isLoading ? (
            <Center h="100%" color="white">
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="orange.500"
                size="xl"
              />
            </Center>
          ) : (
            <>
              <Flex direction={"column"} gap={2}>
                <Flex>
                  <Heading fontSize="md" minW={width}>
                    Title
                  </Heading>
                  <Text >{dbCourse.title}</Text>
                </Flex>

                <Flex>
                  <Heading fontSize="md" minW={width}>
                    Code
                  </Heading>
                  <Text >{dbCourse.code}</Text>
                </Flex>

                <Flex>
                  <Heading fontSize="md" minW={width}>
                    Credit Hours
                  </Heading>
                  <Text >{dbCourse.creditHours}</Text>
                </Flex>

                <Flex>
                  <Heading fontSize="md" minW={width}>
                    Pre Requistes
                  </Heading>
                  <Text >{dbCourse.preRequisites ? dbCourse.preRequisites : "None"}</Text>
                </Flex>

                <Flex>
                  <Heading fontSize="md" minW={width}>
                    Availability
                  </Heading>
                  <Text >{
                    dbCourse.availableTerms.split(",").map((term) => {
                      if (term == "F") return "Fall"
                      else if (term == "S") return "Spring"
                    }).join(", ")
                  }</Text>
                </Flex>

                <Flex>
                  <Heading fontSize="md" minW={width}>
                    College
                  </Heading>
                  <Text >{dbCourse.college.name}</Text>
                </Flex>

                <Flex>
                  <Heading fontSize="md" minW={width}>
                    Department
                  </Heading>
                  <Text >{dbCourse.department.name}</Text>
                </Flex>

                <Flex>
                  <Heading fontSize="md" minW={width}>
                    Description
                  </Heading>
                  <Text width={'80%'}>{dbCourse.description}</Text>
                </Flex>
              </Flex>
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}