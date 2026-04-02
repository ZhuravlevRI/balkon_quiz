import { AxiosError } from "axios"

function extractErrorMessage(err) {
  if (err instanceof AxiosError) {
    return err.response?.data?.detail || err.message
  }

  const errDetail = err.body.detail
  if (Array.isArray(errDetail) && errDetail.length > 0) {
    return errDetail[0].msg
  }
  return errDetail || "Что-то пошло не так :("
}

export const handleError = function (err) {
  const errorMessage = extractErrorMessage(err)
  this(errorMessage)
}
