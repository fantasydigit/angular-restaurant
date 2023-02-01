import { FormGroup } from "@angular/forms";

export function PasswordMatchValidator(form: FormGroup) {
    let password = form.get("password").value;
    let passwordConfirmation = form.get("confirmPassword").value;
    return password === passwordConfirmation
        ? null
        : { unmatch: true };
}
