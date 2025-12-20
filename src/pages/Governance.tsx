import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import { Helmet } from "react-helmet-async";

const Governance = () => {
  return (
    <PageLayout>
      <Helmet>
        <title>Governance & Direction - NexArt Protocol</title>
        <meta name="description" content="How the NexArt protocol evolves. Long-term stewardship, deliberate change, and separation of protocol from product." />
      </Helmet>
      
      <PageHeader 
        title="Governance & Direction"
        subtitle="How the protocol evolves."
      />
      
      <PageContent>
        <div className="prose-protocol">
          <p>
            The NexArt protocol is a living specification. It will change over time as we learn what works, what fails, and what the community needs. This page describes how those changes will be made.
          </p>

          <h2>A Protocol in Development</h2>
          
          <p>
            Many aspects of the protocol are provisional. Some concepts may be revised, renamed, or removed. The specification is stable enough to study, but not yet stable enough to build production systems against.
          </p>
          
          <p>
            We are being transparent about this status. It would be dishonest to claim maturity before the work is done.
          </p>

          <h2>Incremental Enforcement</h2>
          
          <p>
            Protocol enforcement is introduced incrementally. Rather than requiring full conformance from all systems at once, the protocol is applied progressively—starting with modes and system types where validation is most straightforward and expanding as implementations mature. This approach allows the protocol to grow in authority without disrupting existing work or rushing decisions that require careful consideration.
          </p>

          <h2>Deliberate Change</h2>
          
          <p>
            Changes to the protocol will be made deliberately. This means:
          </p>
          
          <ul>
            <li>Changes are proposed, discussed, and documented before implementation</li>
            <li>Backward compatibility is preserved wherever possible</li>
            <li>Breaking changes are introduced only through new major versions</li>
            <li>The rationale for each change is recorded</li>
          </ul>
          
          <p>
            Speed is not a virtue here. Getting it right matters more than shipping fast.
          </p>

          <h2>Protocol vs. Product</h2>
          
          <p>
            The NexArt protocol is separate from any product that implements it. The application at nexart.xyz is one implementation. This documentation site is another artifact. Neither has special authority over the protocol itself.
          </p>
          
          <p>
            The protocol is designed so that systems remain interpretable and renderable by future tools, even if the current application changes or disappears. This is a goal we are actively working toward—building in the durability that makes the protocol independent of any single product.
          </p>
          
          <p>
            This separation is intentional and permanent.
          </p>

          <h2>Future Stewardship</h2>
          
          <p>
            Long-term stewardship of the protocol will be handled by the NexArt Foundation—a stewardship structure that is being formed.
          </p>
          
          <p>
            The Foundation will be responsible for:
          </p>
          
          <ul>
            <li>Maintaining the specification</li>
            <li>Publishing reference implementations</li>
            <li>Coordinating with implementers</li>
            <li>Ensuring the protocol remains open and accessible</li>
          </ul>
          
          <p>
            Details about the Foundation—its legal structure, membership, and processes—will be developed as the protocol matures.
          </p>

          <h2>What Governance Is Not</h2>
          
          <p>
            NexArt governance is not:
          </p>
          
          <ul>
            <li>A DAO with token voting</li>
            <li>A corporate committee behind closed doors</li>
            <li>A popularity contest</li>
            <li>A mechanism for monetization</li>
          </ul>
          
          <p>
            Governance exists to protect the protocol's integrity and serve its users. It is a responsibility, not a product.
          </p>

          <h2>Principles</h2>
          
          <p>
            These principles guide the protocol's evolution:
          </p>
          
          <p>
            <strong>Stability.</strong> Systems created today should work indefinitely. Change should not break the past.
          </p>
          
          <p>
            <strong>Openness.</strong> The specification, documentation, and reference implementations will remain publicly accessible.
          </p>
          
          <p>
            <strong>Clarity.</strong> We document what we know and what we do not know. Ambiguity is acknowledged, not hidden.
          </p>
          
          <p>
            <strong>Patience.</strong> Good protocols take time. Rushing leads to regret.
          </p>

          <h2>Your Role</h2>
          
          <p>
            If you are reading this, you are part of the protocol's early community. Your feedback, questions, and eventual contributions will shape what NexArt becomes.
          </p>
          
          <p>
            For now, the most valuable thing you can do is read carefully, think critically, and consider how you might participate.
          </p>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default Governance;
