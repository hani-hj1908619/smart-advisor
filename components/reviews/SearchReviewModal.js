import {SearchIcon} from '@chakra-ui/icons';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    useDisclosure, InputRightElement, InputGroup, InputLeftElement
} from '@chakra-ui/react';
import {useEffect, useRef, useState} from 'react'
import ReviewDetails from "./ReviewDetails";
import SearchReviewCard from "./SearchReviewCard";

export default function SearchReviewModal({isOpen, modalOnClose, groupedReviews}) {
    const [searchQuery, setSearchQuery] = useState('')
    const [isSearchTypeClicked, setIsSearchTypeClicked] = useState(false)
    const inputRef = useRef(null);
    const queriedReview = useRef({})
    const {
        isOpen: isOpenDetailModal, onOpen: onOpenDetailModal, onClose: onCloseDetailModal
    } = useDisclosure() // review detail modal

    useEffect(() => {
        setTimeout(() => {
            inputRef.current.focus();
        }, 100);
    }, []);

    return (
        <Box>
            <Modal isOpen={isOpen} onClose={modalOnClose} size='xl'>
                <ModalOverlay/>
                <ModalContent>
                    <ModalHeader>Search Review</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody mb='5%'>
                        <FormControl>
                            <FormLabel>{isSearchTypeClicked ? 'Course Code' : 'Instructor'}</FormLabel>
                            <InputGroup width="auto" mt='2%'>
                                <InputLeftElement pointerEvents='none'>
                                    <SearchIcon color='gray.300'/>
                                </InputLeftElement>
                                <InputRightElement width='5.5rem' mr='2%' justifyContent='flex-end'>
                                    <Button h='1.75rem' size='sm'
                                            onClick={() => setIsSearchTypeClicked(!isSearchTypeClicked)}>
                                        {isSearchTypeClicked ? 'Course' : 'Instructor'}
                                    </Button>
                                </InputRightElement>
                                <Input ref={inputRef} width="100%"
                                       placeholder={isSearchTypeClicked ? 'CMPS355' : 'Ali Ibrahim'} value={searchQuery}
                                       onChange={(e) => setSearchQuery(e.target.value)}/>

                            </InputGroup>

                        </FormControl>

                        {isOpenDetailModal &&
                            <ReviewDetails isOpen={isOpenDetailModal} onClose={onCloseDetailModal}
                                           review={queriedReview.current}/>}


                        {
                            searchQuery.length > 0
                            && (isSearchTypeClicked ?
                                    (groupedReviews.current.filter((review) => review.course?.code?.toLowerCase().includes(searchQuery.toLowerCase())).map((review) => (
                                        <SearchReviewCard key={review.id} queriedReview={queriedReview} review={review}
                                                    onOpenDetailModal={onOpenDetailModal}/>))) :
                                    (
                                        groupedReviews.current.filter((review) => review.instructor?.name?.toLowerCase().includes(searchQuery.toLowerCase())).map((review) => (
                                            <SearchReviewCard key={review.id} queriedReview={queriedReview}
                                                        review={review}
                                                        onOpenDetailModal={onOpenDetailModal}/>))
                                    )
                            )
                        }
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    )
}