/**
 * 出行计划类型声明
 */
export interface TouristPlan {
    id: string
    cities: {
        code: string,
        name: string
    }[]
    depatureAt: number
    attractions: {
        code: string
        name: string
        belongTo: string
    }[]
    duration: number
}

/**
 * 创建出行计划输入
 */
export type CreateTouristPlanInput = Pick<TouristPlan, "depatureAt" | "attractions" | "cities" | 'duration'>