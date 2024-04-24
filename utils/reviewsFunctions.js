export function calculateReviewOVR(review) {
    const instructorOVR = parseFloat((review.teaching + review.grading + review.overall) / 3)
    const courseOVR = parseFloat((review.material + review.difficulty + review.courseLoad) / 3)
    if (review.instructorId) {

        return instructorOVR % 1 === 0 ? instructorOVR : instructorOVR.toFixed(1)
    } else
        return courseOVR % 1 === 0 ? courseOVR : courseOVR.toFixed(1)
}


