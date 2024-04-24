import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Center,
  Checkbox,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Select,
  Spinner,
  Text,
  useBoolean,
  useToast,
} from "@chakra-ui/react";
import CommonRadio from "components/common/CommonRadio";
import { useState } from "react";
import { getCookie } from "../../pages/api/util/getCookie";

export default function PreferenceForm({
  userId,
  showPrefs,
  setShowPrefs,
  setSchedule,
  setScheduleOutdated,
  setUnsavedChanges,
  setScheduleUnchanged,
  setErrors,
  message,
  gender,
  joinYear
}) {
  const [includeFullSections, setIncludeFullSections] = useState(false)
  const [prefTimimg, setPrefTimimg] = useState("Any");
  const [prefLanguage, setPrefLanguage] = useState("english")
  const [isLoading, setIsLoading] = useBoolean();
  const toast = useToast();

  async function generateSchedule() {
    const { userToken } = getCookie({}, "userSession");

    setIsLoading.on();
    const res = await fetch(
      `http://localhost:3000/api/user/${userId}/schedule/generate?includeFull=${includeFullSections}&language=${prefLanguage}&timings=${prefTimimg}&gender=${gender}&joinYear=${joinYear}`,
      { headers: { Authorization: `bearer ${userToken}` } }
    );
    setIsLoading.off();

    if (!res.ok)
      toast({
        title: "Something went wrong",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    else {
      const data = await res.json();

      if (!data.error) {
        setSchedule(data);
        setScheduleUnchanged(data);
        setScheduleOutdated(false);
        setUnsavedChanges.on();
      } else {
        setErrors((prev) => {
          return {
            ...prev,
            error: true,
            description: data.errorDesc,
            noPlan: data.error == "noPlan" ? true : false,
            package: data.error == "package" ? true : false,
            notPossible: data.error == "notPossible" ? true : false,
          };
        });
      }
    }
  }

  return (
    <>
      <AlertDialog isOpen={showPrefs} onClose={setShowPrefs.off} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>
              <Text fontSize="xl" fontWeight="bold">
                Generate Semester Schedule
              </Text>
              <Text fontSize="md">{message}</Text>
            </AlertDialogHeader>

            <AlertDialogBody>
              <FormLabel fontSize={"lg"}>Preferences:</FormLabel>
              <Flex direction={"column"} gap={2} p={2}>
                <FormControl>
                  <Checkbox
                    value={includeFullSections}
                    onChange={e => { setIncludeFullSections(e.target.checked) }}
                  >
                    Include full sections
                  </Checkbox>
                </FormControl>

                {/* <FormControl>
                  <FormLabel>Language of instruction</FormLabel>
                  <Select
                    placeholder="Select option"
                    defaultValue={"english"}
                    value={prefLanguage}
                    onChange={(e) => setPrefLanguage(e.target.value)}
                  >
                    <option value="english">English</option>
                    <option value="arabic">Arabic</option>
                  </Select>
                </FormControl> */}

                <FormControl>
                  <FormLabel>Timings</FormLabel>
                  <CommonRadio
                    radioOptions={["Any", "Early", "Late"]}
                    setValue={setPrefTimimg}
                    value={prefTimimg}
                  />
                </FormControl>
              </Flex>
            </AlertDialogBody>

            <AlertDialogFooter justifyContent={"space-between"}>
              {isLoading && (
                <Flex gap={2} p={1}>
                  <Spinner
                    thickness="4px"
                    speed="0.65s"
                    emptyColor="gray.200"
                    color="orange.500"
                    size="md"
                  />
                  <Text>Generating schedule...</Text>
                </Flex>
              )}

              <Button
                colorScheme="blue"
                disabled={isLoading}
                onClick={async () => {
                  await generateSchedule();
                  setShowPrefs.off();
                }}
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