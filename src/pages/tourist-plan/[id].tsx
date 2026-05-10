import { useLazyQuery, useMutation } from "@apollo/client/react";
import {
  CREATE_TOURIST_PLAN,
  listenTouristPlanProposal,
  TOURIST_PLAN,
} from "../../api/tourist-plan.api";
import { useNavigate, useParams } from "@aiszlab/bee/router";
import { Button, IconButton, Message, RichTextEditor, Tag } from "musae";
import { useAsyncEffect } from "@aiszlab/relax";
import { useState } from "react";
import { TouristPlan as TouristPlanType } from "../../api/tourist-plan.types";
import { KeyboardArrowLeft, LocationOn, Share } from "musae/icons";
import { stringify } from "@aiszlab/relax/class-name";
import dayjs from "dayjs";
import { clipboard } from "@aiszlab/relax/dom";
import useAppStore from "../../stores/app.store";

function TouristPlan() {
  const { id } = useParams();
  const [queryTouristPlan] = useLazyQuery(TOURIST_PLAN);
  const [touristPlan, setTouristPlan] = useState<TouristPlanType>();
  const [createTouristPlan] = useMutation(CREATE_TOURIST_PLAN);
  const navigate = useNavigate();
  const { getAppId } = useAppStore();

  useAsyncEffect(async () => {
    if (!id) return;
    const _touristPlan = (await queryTouristPlan({ variables: { id } }).catch(() => null))?.data
      ?.touristPlan;

    setTouristPlan(_touristPlan);
    if (!_touristPlan) return;
    if (_touristPlan.proposal) return;

    listenTouristPlanProposal({
      id,
      onProposal: (proposal) => {
        setTouristPlan((prev) => {
          return {
            ...prev,
            ..._touristPlan,
            proposal: (prev?.proposal ?? "") + proposal,
          };
        });
      },
    });
  }, [id]);

  const regenerate = async () => {
    const _newId = (
      await createTouristPlan({
        variables: {
          input: {
            attractions: (touristPlan?.attractions ?? []).map((_item) => ({
              code: _item.code,
              name: _item.name,
              cityCode: _item.cityCode,
            })),
            cities: (touristPlan?.cities ?? []).map((_item) => ({
              name: _item.name,
              code: _item.code,
            })),
            depatureAt: touristPlan?.depatureAt ?? 0,
            duration: touristPlan?.duration ?? 0,
            belongToId: await getAppId(),
          },
        },
      }).catch(() => null)
    )?.data?.createTouristPlan.id;

    if (!_newId) return;
    navigate(`/tourist-plan/${_newId}`, {
      replace: true,
    });
  };

  const share = () => {
    clipboard(window.location.href);
    Message.success({
      description: "已成功复制到剪贴板",
    });
  };

  const goBack = () => {
    navigate("/");
  };

  return (
    <div>
      <div className="bg-color-primary text-color-on-primary p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <IconButton size="small" color="secondary" onClick={goBack}>
            <KeyboardArrowLeft size={24} />
          </IconButton>

          <h1>专属旅行计划</h1>

          <IconButton size="small" color="secondary" onClick={share}>
            <Share />
          </IconButton>
        </div>

        <div
          className={stringify(
            "backdrop-blur-2xl bg-color-on-primary-20 rounded-2xl border border-(--color-on-primary-20) p-3",
            "flex flex-col gap-2",
          )}
        >
          <div>行程规划完成</div>

          <div className="flex gap-2 justify-between items-center mx-4">
            <span>{touristPlan?.duration}天行程</span>
            <span>{touristPlan?.cities.length}个城市</span>
            <span>{touristPlan?.attractions.length}个景点</span>
          </div>

          <div className="rounded-full backdrop-blur-2xl bg-color-on-primary-20 py-2 flex justify-center items-center gap-1">
            {dayjs(touristPlan?.depatureAt).format("MM月DD日")}
            <span>-</span>
            {dayjs(touristPlan?.depatureAt)
              .add(touristPlan?.duration ?? 0, "day")
              .format("MM月DD日")}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {touristPlan?.cities.map((_city) => {
            return (
              <Tag key={_city.code}>
                <LocationOn />
                {_city.name}
              </Tag>
            );
          })}
        </div>
      </div>

      <RichTextEditor
        value={touristPlan?.proposal}
        use="markdown"
        disabled
        className="p-5 min-h-screen"
      />

      <div
        className={stringify(
          "flex gap-2 justify-between p-5 sticky bottom-0 bg-color-on-primary border-t border-color-outline",
          "items-center",
        )}
      >
        <Button onClick={regenerate}>重新规划</Button>

        <IconButton size="small" onClick={share}>
          <Share />
        </IconButton>
      </div>
    </div>
  );
}

export default TouristPlan;
