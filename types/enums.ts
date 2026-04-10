export enum PostType {
  News = 'news',
  Job = 'job',
}

export enum AdStatus {
  Active = 'active',
  Paused = 'paused',
  Completed = 'completed',
}

export enum ApplicationStatus {
  Pending = 'pending',
  Reviewed = 'viewed',
  Accepted = 'hired',
  Rejected = 'rejected',
}

export enum DocumentType {
  CV = 'cv',
  CoverLetter = 'cover_letter',
  Qualification = 'qualification',
  NationalId = 'national_id',
  DriversLicence = 'drivers_licence',
  Other = 'other',
}

export enum UserType {
  User = 'user',
  Business = 'business',
}

export enum ProfileRole {
  User = 'user',
  Admin = 'admin',
}

export enum NotificationType {
  POST_LIKE = 'post_like',
  POST_COMMENT = 'post_comment',
  POST_BOOKMARK = 'post_bookmark',
  COMMENT_LIKE = 'comment_like',
  APPLICATION_STATUS = 'application_status',
  COMPANY_STATUS = 'company_status',
} 
