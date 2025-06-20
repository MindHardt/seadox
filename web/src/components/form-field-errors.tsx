import {FieldApi, FieldState} from "@tanstack/react-form";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {AlertCircleIcon} from "lucide-react";
import { ZodError } from "zod";

export default function FormFieldErrors({ field } : {
    field: FieldApi<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>
}) {
    return !field.state.meta.isValid && <Alert variant='destructive'>
        <AlertCircleIcon />
        <AlertDescription>
            <ul className='list-inside list-disc text-sm'>
                {field.state.meta.errors.map(err => {
                    const [key, msg] = [`${err.path?.join('.')}.${err?.code}`, err.message];
                    return <li key={key}>{msg}</li>;
                })}
            </ul>
        </AlertDescription>
    </Alert>
}