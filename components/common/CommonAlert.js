import {
    AlertDialog, AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button
} from '@chakra-ui/react';
import { useRef } from 'react';

export default function CommonAlert({ isOpen, onClose, type, planName, handleFn }) {
    const cancelRef = useRef()

    return (
        <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
            isCentered
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                        {type == "delete" &&
                            `Delete plan - ${planName}`
                        } {type == "unsaved" &&
                            `Unsaved changes`
                        }
                        {type == "discard" &&
                            `Discard changes`
                        }
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        {(type == "delete" || type == "discard") &&
                            `Are you sure? You can't undo this action afterwards.`
                        }
                        {type == "unsaved" &&
                            `You have unsaved changes. Please save or discard them.`
                        }

                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef}
                            onClick={onClose}>
                            Cancel
                        </Button>
                        {(type == "delete" || type == "discard") &&
                            <Button colorScheme='red' onClick={handleFn} ml={3}>
                                {type == "delete" ? `Delete` : `Discard`}
                            </Button>
                        }
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    )
}