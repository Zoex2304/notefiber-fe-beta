Now we just need to integrate the payment gateway, which is actually already documented in the API documentation file located at:

docs/api/api.md

What you need to do first is open that file and understand how the backend handles the payment process. Once you fully understand how the payment gateway is managed on the backend side, we can proceed to the next step: designing the overall strategy.

If we look at the landing page, there is a Pricing component, which is designed to be reusable. However, our main focus should be on the primary workspace under /app. From there, we already have a Profile Settings section that is represented by the Avatar in the UI. When the Avatar is clicked, a dropdown appears, but currently it only contains two options: Account Settings and Logout.

What I want to add there is a Subscription Plan button. When the user clicks this button, they should be navigated to a Pricing page—something simple and straightforward, similar to the pricing page of Claude AI.

In the middle of the pricing section, I want one plan to be visually emphasized as the most popular plan, which is a common commercial pattern. For example, you might have Free, Pro, and Enterprise plans, where the middle plan is slightly larger and marked as “Best Seller” or “Most Popular.” This is just the general idea—the actual implementation should follow the existing Pricing component. Since that component already supports three plans, the middle one should be visually highlighted.

Please check whether the Pricing component is currently dynamic. If it is not, make it dynamic so that the sizes, labels, and emphasis can be adjusted easily. That would be the first stage.

Next, we move to the second stage. When a user clicks on any of the three pricing buttons, they should be redirected to the Checkout page. The Checkout component already exists and is even wired from the landing page when the user clicks on a pricing option.

However, the user should not be able to access the Checkout page unless they are logged in. As far as I understand, this behavior is already implemented, so the Checkout page should only be accessible within the authenticated workspace.

On the Checkout page, there is currently a placeholder slot for Midtrans Snap Payment. That placeholder should be removed. Instead, on the right-side panel, there is a button. When the user clicks that button, the original Midtrans Snap Payment UI should appear as an overlay. The background should be blurred while the Snap Payment overlay is active.

Once the user successfully completes the payment, the backend process is already clearly explained in the documentation. Please refer carefully to:

docs/api/api.md

On the Checkout page, the user must also fill in several pieces of information, such as ZIP code, country, state, and other related details. The API endpoints for fetching these dropdown values already exist, and I would like these fields to use searchable dropdowns.

For this, please use a React UI component library that supports searchable select inputs. You may suggest and install a suitable library for this purpose (please mention the library name). Even though I am currently using Shadcn, it is perfectly fine to combine it with other UI libraries if needed.