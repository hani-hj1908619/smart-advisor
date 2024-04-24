import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  FormControl,
  FormLabel,
  Box,
  Button,
  Select,
  Text,
} from "@chakra-ui/react";
import CommonRadio from "components/common/CommonRadio";
import CommonSlider from "components/common/CommonSlider";
import { useEffect, useState } from "react";
import { getCookie } from "../../pages/api/util/getCookie";

export default function GeneratePlanForm({
  showAlert,
  setShowAlert,
  existingPlans,
  generatePlanFn,
}) {
  const [majors, setMajors] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedMajorId, setSelectedMajorId] = useState(0);
  const [selectedSemesterId, setSelectedSemesterId] = useState(0);

  const maxMajorCourseOptions = ["2", "3", "4"];
  const [maxMajorCourse, setMaxMajorCourse] = useState(
    maxMajorCourseOptions[0]
  );

  useEffect(() => {
    const { userToken } = getCookie({}, "userSession");
    if (!semesters.length) {
      fetch("http://localhost:3000/api/semesters?mainSems=true", {
        headers: { Authorization: `bearer ${userToken}` },
      })
        .then((res) => res.json())
        .then((data) => {
          const semOptions = data.map((s) => {
            return { value: `${s.id}`, label: s.name };
          });
          setSemesters(semOptions);
          // Set selected start sem as Fall by default
          const fallSem = data.find((s) => s.name.toLowerCase() == "fall");
          if (fallSem) setSelectedSemesterId(`${fallSem.id}`);
        });
    }

    if (!majors.length) {
      fetch("http://localhost:3000/api/majors", {
        headers: { Authorization: `bearer ${userToken}` },
      })
        .then((res) => res.json())
        .then((data) => setMajors(data));
    }
  }, []);

  return (
    <>
      <AlertDialog
        isOpen={showAlert}
        onClose={() => {
          if (existingPlans) setShowAlert.off();
        }}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>
              <Text fontSize="xl" fontWeight="bold">
                Create study plan
              </Text>
              {!existingPlans && (
                <Text fontSize="md">Get started with your first plan now</Text>
              )}
            </AlertDialogHeader>

            <AlertDialogBody>
              <Box>
                <FormControl>
                  <FormLabel>Major</FormLabel>
                  <Select
                    onChange={(e) =>
                      setSelectedMajorId(parseInt(e.target.value))
                    }
                    defaultValue={0}
                  >
                    <option disabled value={0}>Major</option>
                    {majors.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {/* <FormControl>
                  <FormLabel>Start semester</FormLabel>
                  <CommonRadio
                    radioOptions={semesters}
                    value={selectedSemesterId}
                    setValue={setSelectedSemesterId}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel mt={2}>Max. Credit Hours Per Semester</FormLabel>
                  <CommonSlider
                    min={12}
                    max={18}
                    labelMin="Easy"
                    labelMax="Hard"
                    defaultValue={18}
                    step={1}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel mt={3}>Max. Major Courses Per Semester</FormLabel>
                  <CommonRadio
                    radioOptions={maxMajorCourseOptions}
                    value={maxMajorCourse}
                    setValue={setMaxMajorCourse}
                  />
                </FormControl> */}
              </Box>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                colorScheme="blue"
                isDisabled={!selectedMajorId}
                onClick={() =>
                  generatePlanFn(selectedMajorId, selectedSemesterId)
                }
              >
                Generate Plan
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}