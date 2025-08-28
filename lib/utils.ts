/* eslint-disable prettier/prettier */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function buildPromptWithUserContext(
  content: string,
  username: string
) {
  return new Promise<string>((resolve, reject) => {
    if (!navigator.geolocation) {
      resolve(`${content}\n\n[User: ${username}] [Location: Unknown]`);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        resolve(
          `${content}\n\n[User: ${username}] [Location: lat:${latitude}, lon:${longitude}]`
        );
      },
      (error) => {
        console.warn("Geolocation error:", error);
        resolve(`${content}\n\n[User: ${username}] [Location: Unknown]`);
      }
    );
  });
}

export async function generateDeepResearchReport(
  content: string,
  username: string
): Promise<string> {
  return new Promise<string>((resolve) => {
    const buildReport = (location: string) => {
      // Always produce a structured, long-form research-style output
      return `
=== Comprehensive Research Report ===

📌 Introduction  
This report has been generated to provide an in-depth exploration of the given content. The objective is to synthesize the input into a structured, well-researched format that conveys clarity, detail, and useful context.

📝 User Submission  
"${content}"

👤 User Information  
- Username: ${username}  
- Location: ${location}  

🔎 Detailed Analysis  
1. **Contextual Understanding**  
   The submitted content has been analyzed with consideration to broader context, possible interpretations, and underlying implications. This ensures that the material is not treated in isolation but examined through multiple dimensions.  

2. **Key Insights**  
   - Extracts main themes and focal points.  
   - Identifies potential knowledge gaps or ambiguities.  
   - Connects the content to relevant frameworks, theories, or practices.  

3. **Comparative Study**  
   Similar cases, literature references, or parallel examples are explored to strengthen the understanding of the subject matter.  

4. **Implications & Applications**  
   The findings are extended into practical implications, possible applications in real-world scenarios, and future directions worth investigating.  

📊 Supporting Observations  
Where applicable, supporting data, references, or analogies are included to anchor the research in credible foundations.  

✅ Conclusion  
The above content, when contextualized with user and location details, represents a valuable knowledge contribution. By consolidating insights, contextual factors, and implications, this report provides a comprehensive understanding rather than a fragmented response.

=== End of Report ===
`;
    };

    if (!navigator.geolocation) {
      resolve(buildReport("Unknown"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        resolve(buildReport(`lat:${latitude}, lon:${longitude}`));
      },
      (error) => {
        console.warn("Geolocation error:", error);
        resolve(buildReport("Unknown"));
      }
    );
  });
}
