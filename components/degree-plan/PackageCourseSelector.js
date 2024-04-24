import {
  Box,
  Card,
  Center,
  Divider,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { getCookie } from "../../pages/api/util/getCookie";

export default function PackageCourseSelector({
  selectedPlanCourse,
  isOpen,
  onClose,
  onSelect,
}) {
  const [packageCourses, setPackageCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const selectedCourseStyle = {
    borderColor: "rgba(165, 203, 255, 1)",
    borderWidth: "2px",
  };

  useEffect(() => {
    const { userToken } = getCookie({}, "userSession");
    setIsLoading(true);
    fetch(`./api/courses?packageId=${selectedPlanCourse.package.id}`, {
      headers: { Authorization: `bearer ${userToken}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setPackageCourses(data);
        setIsLoading(false);
      });
  }, [selectedPlanCourse]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent p={5}>
        <ModalHeader>
          {selectedPlanCourse.package.name}
          <Divider />
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
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
            <Box maxH={"70vh"} overflowY={"scroll"}>
              {packageCourses.map((c) => (
                <Card
                  key={c.id}
                  p={2}
                  mb={2}
                  _hover={{ bgColor: "rgba(0, 94, 255, 0.2)" }}
                  cursor={"pointer"}
                  onClick={() => onSelect(c)}
                  sx={
                    c.id == selectedPlanCourse.courseId
                      ? selectedCourseStyle
                      : {}
                  }
                >
                  <Text>{c.title}</Text>
                </Card>
              ))}
            </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}