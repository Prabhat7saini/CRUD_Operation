// src/constants/messages.ts

export const ERROR_MESSAGES = {
    REQUIRED_ID_OR_EMAIL: 'Either email or id is required',
    DATABASE_ERROR: 'An error occurred while retrieving the user',
    UNEXPECTED_ERROR_CREATE_USER: 'An unexpected error occurred while retrieving the user',
    USER_ALREADY_EXISTS: 'A user with this email already exists',
    USER_CREATION_FAILED: 'An unexpected error occurred while creating the user',
    USER_UPDATE_FAILED: 'An unexpected error occurred while updating the user',
    USER_FETCH_FAILED: 'Unable to fetch users at the moment. Please try again later.',
    USER_NOT_FOUND: 'User not found',
    ID_REQUIRED: 'Id is required',
    USER_DELETION_FAILED: 'An unexpected error occurred while deleting the user',
    USER_NOT_FOUND_BY_ID: (id: number) => `User with id ${id} not found`,
    UNEXPECTED_ERROR:'An unexpected error occurred',
    INVALID_CREDENTIALS:'Invalid credentials'
    
};

export const SUCCESS_MESSAGES = {
    USER_CREATED_SUCCESSFULLY: 'User created successfully',
    USER_UPDATED_SUCCESSFULLY: 'User updated successfully',
    USER_DELETED_SUCCESSFULLY: 'User successfully deleted',
    USER_FETCHED_SUCCESSFULLY: 'User successfully fetched',
    USER_LOGIN_SUCCESSFULLY: 'User Login Successfully'
};
