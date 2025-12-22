import Appbar from "@/components/Appbar/Appbar";
import { FormProvider } from "@/components/boardingAll/FormContext";
import { Stepper } from "@/components/boardingAll/stepper";

export default function Boarding() {
  return (
    <div className=" ">
      <Appbar />
      <FormProvider>
      <div className="">
        <Stepper />
      </div>
    </FormProvider>
    </div>
  );
}
