import { useMutation } from "@apollo/client/react";
import { useNavigate, useParams } from "@aiszlab/bee/router";
import { Button, IconButton, Input, Textarea } from "musae";
import { KeyboardArrowLeft } from "musae/icons";
import { useMemo, useState } from "react";
import { UPDATE_TOURIST_PLAN_ITINERARY } from "../../api/tourist-plan-itinerary.api";
import { UpdateTouristPlanItineraryInput } from "../../api/tourist-plan-itinerary.types";
import { useTouristPlanContext } from "../../contexts/tourist-plan.context";
import TouristPlanFooter from "../../components/tourist-plan/footer";

const MS_PER_HOUR = 60 * 60 * 1000;

function TouristPlanItineraryEdit() {
  const navigate = useNavigate();
  const { itineraryId } = useParams();
  const { touristPlan, setTouristPlan } = useTouristPlanContext();
  const [updateItinerary, { loading }] = useMutation(UPDATE_TOURIST_PLAN_ITINERARY);

  const itinerary = useMemo(
    () => touristPlan?.itineraries?.find((item) => item.id === itineraryId),
    [touristPlan?.itineraries, itineraryId],
  );

  const [name, setName] = useState(() => itinerary?.name ?? "");
  const [description, setDescription] = useState(() => itinerary?.description ?? "");
  const [tip, setTip] = useState(() => itinerary?.tip ?? "");
  const [durationHours, setDurationHours] = useState(() =>
    itinerary?.duration ? String(itinerary.duration / MS_PER_HOUR) : "",
  );

  const handleSave = async () => {
    if (!name.trim() || !itinerary || !itineraryId) return;

    const input: UpdateTouristPlanItineraryInput = {};
    if (name !== itinerary.name) input.name = name;
    if (description !== itinerary.description) input.description = description;
    if (tip !== itinerary.tip) input.tip = tip;

    const durationMs = Number(durationHours) * MS_PER_HOUR;
    if (durationMs && durationMs !== itinerary.duration) {
      input.duration = durationMs;
    }

    const result = await updateItinerary({
      variables: { id: itineraryId, input },
    }).catch(() => null);

    if (!result?.data?.updateTouristPlanItinerary) return;

    // Update the itinerary in context in-place
    if (setTouristPlan && touristPlan) {
      setTouristPlan({
        ...touristPlan,
        itineraries: (touristPlan.itineraries ?? []).map((item) =>
          item.id === itineraryId ? result.data!.updateTouristPlanItinerary : item,
        ),
      });
    }

    navigate(-1);
  };

  // Not found — should only happen if the ID is invalid or data hasn't loaded
  if (!itinerary) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="bg-color-primary text-color-on-primary p-5 safe-pt-5 flex items-center gap-2 sticky top-0 z-10">
          <IconButton size="small" color="secondary" onClick={() => navigate(-1)}>
            <KeyboardArrowLeft size={24} />
          </IconButton>
          <h1>编辑行程</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p>未找到该行程</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-color-primary text-color-on-primary p-5 safe-pt-5 flex items-center gap-2 sticky top-0 z-10">
        <IconButton size="small" color="secondary" onClick={() => navigate(-1)}>
          <KeyboardArrowLeft size={24} />
        </IconButton>
        <h1>编辑行程</h1>
      </div>

      <div className="flex-1 px-5 py-4 flex flex-col gap-4">
        <Input
          placeholder="名称"
          value={name}
          onChange={setName}
          disabled={loading}
        />

        <Textarea
          placeholder="描述"
          value={description}
          onChange={setDescription}
        />

        <Textarea
          placeholder="小贴士"
          value={tip}
          onChange={setTip}
        />

        <Input
          placeholder="建议时长（小时）"
          type="number"
          value={durationHours}
          onChange={setDurationHours}
          disabled={loading}
        />
      </div>

      <TouristPlanFooter>
        <Button className="w-full" onClick={handleSave} loading={loading}>
          保存
        </Button>
      </TouristPlanFooter>
    </div>
  );
}

export default TouristPlanItineraryEdit;
