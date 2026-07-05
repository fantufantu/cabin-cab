import { useMutation } from "@apollo/client/react";
import { BottomSheet, Button, Form, Input, Message, Textarea } from "musae";
import { useEffect } from "react";
import { UPDATE_TOURIST_PLAN_ITINERARY } from "../../../api/tourist-plan-itinerary.api";
import type { TouristPlanItinerary, UpdateTouristPlanItineraryInput } from "../../../api/tourist-plan-itinerary.types";
import { useTouristPlanContext } from "../../../contexts/tourist-plan.context";

const MS_PER_HOUR = 60 * 60 * 1000;

interface ItineraryFormValues {
  name: string;
  description: string;
  tip: string;
  durationHours: string;
}

interface Props {
  itinerary?: TouristPlanItinerary | null;
  open: boolean;
  onClose: VoidFunction;
}

function ItineraryEditor({ itinerary, open, onClose }: Props) {
  const { touristPlan, setTouristPlan } = useTouristPlanContext();
  const [updateItinerary, { loading }] = useMutation(UPDATE_TOURIST_PLAN_ITINERARY);

  const form = Form.useForm<ItineraryFormValues>({
    defaultValue: {
      name: "",
      description: "",
      tip: "",
      durationHours: "",
    },
  });

  // Reset form values when sheet opens for a specific itinerary
  useEffect(() => {
    if (open && itinerary) {
      form.setFieldsValue({
        name: itinerary.name ?? "",
        description: itinerary.description ?? "",
        tip: itinerary.tip ?? "",
        durationHours: itinerary.duration ? String(itinerary.duration / MS_PER_HOUR) : "",
      });
    }
  }, [open, itinerary?.id]);

  const handleSave = async () => {
    const values = form.getFieldsValue();
    if (!values.name?.trim() || !itinerary?.id) return;

    const input: UpdateTouristPlanItineraryInput = {};
    if (values.name !== itinerary.name) input.name = values.name;
    if (values.description !== itinerary.description) input.description = values.description;
    if (values.tip !== itinerary.tip) input.tip = values.tip;

    const durationMs = Number(values.durationHours) * MS_PER_HOUR;
    if (durationMs && durationMs !== itinerary.duration) {
      input.duration = durationMs;
    }

    const result = await updateItinerary({
      variables: { id: itinerary.id, input },
    }).catch(() => null);

    if (!result?.data?.updateTouristPlanItinerary) return;

    // Update the itinerary in context in-place
    if (setTouristPlan && touristPlan) {
      setTouristPlan({
        ...touristPlan,
        itineraries: (touristPlan.itineraries ?? []).map((item) =>
          item.id === itinerary.id ? result.data!.updateTouristPlanItinerary : item,
        ),
      });
    }

    Message.success({ description: "保存成功" });
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} height="auto">
      <div className="p-4 flex flex-col gap-4">
        <h2 className="text-lg font-semibold">编辑行程</h2>

        <Form form={form}>
          <Form.Item name="name" label="名称" required>
            <Input placeholder="名称" disabled={loading} />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <Textarea placeholder="描述" />
          </Form.Item>

          <Form.Item name="tip" label="小贴士">
            <Textarea placeholder="小贴士" />
          </Form.Item>

          <Form.Item name="durationHours" label="建议时长（小时）">
            <Input placeholder="建议时长（小时）" type="number" disabled={loading} />
          </Form.Item>
        </Form>

        <Button className="w-full" onClick={handleSave} loading={loading}>
          保存
        </Button>
      </div>
    </BottomSheet>
  );
}

export default ItineraryEditor;
