export interface InvitationEmailInput {
    to: string;
    displayName: string;
    role: string;
    invitedBy: string;
    temporaryPassword: string;
}
export declare function sendInvitationEmail(input: InvitationEmailInput): Promise<void>;
export interface PasswordResetEmailInput {
    to: string;
    displayName: string | null;
    resetLink: string;
}
export declare function sendPasswordResetEmail(input: PasswordResetEmailInput): Promise<void>;
//# sourceMappingURL=emailService.d.ts.map