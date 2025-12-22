import {fetchCourseById, fetchCourses, mockCourses} from "@/lib/api";

jest.mock("../services/courses", () => {
  const originalModule = jest.requireActual("../services/courses");
  return {
    ...originalModule,
    mockCourses: require("../__mocks__/mockCourses").mockCourses,
  };
});

describe("fetchCourses", () => {
  it("возвращает все курсы без фильтра", async () => {
    const result = await fetchCourses();
    expect(result.results.length).toBe(mockCourses.length);
    expect(result.pagination.total).toBe(mockCourses.length);
    expect(result.pagination.page).toBe(1);
  });

  it("фильтрует курсы по заголовку", async () => {
    const result = await fetchCourses("JavaScript");
    expect(result.results.length).toBe(2);
    expect(result.results[0].title).toContain("JavaScript");
  });

  it("фильтрует курсы по описанию", async () => {
    const result = await fetchCourses("SQL");
    expect(result.results.length).toBe(1);
    expect(result.results[0].course_id).toBe("DB101");
  });

  it("возвращает правильную пагинацию", async () => {
    // создаём 35 курсов для проверки
    const bigMock = Array.from({ length: 35 }, (_, i) => ({
      course_id: `C${i}`,
      title: `Course ${i}`,
      description: "Test",
      department: "General",
    }));
    (global as any).mockCourses = bigMock;

    const result = await fetchCourses("", 2);
    expect(result.results.length).toBe(5); // 35 - 30 = 5
    expect(result.pagination.page).toBe(2);
    expect(result.pagination.pages).toBe(2);
  });
});

describe("fetchCourseById", () => {
  it("возвращает курс по ID", async () => {
    const course = await fetchCourseById("JS101");
    expect(course.title).toBe("JavaScript Basics");
  });

  it("работает с регистронезависимым ID", async () => {
    const course = await fetchCourseById("js201");
    expect(course.course_id).toBe("JS201");
  });

  it("выбрасывает ошибку если курс не найден", async () => {
    await expect(fetchCourseById("UNKNOWN")).rejects.toThrow("Курс не найден");
  });
});

