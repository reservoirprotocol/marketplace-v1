import { ReactNode } from 'react'
import Layout from 'components/Layout'
import { NextPage } from 'next'
import Head from 'next/head'

const metadata = {
  title: (title: string) => <title>{title}</title>,
}

const H1 = ({ children }: { children: string }) => (
  <h1 className="text-2xl font-bold mb-4">{children}</h1>
);

const H2 = ({ children }: { children: string }) => (
  <h2 className="text-xl font-bold mb-2">{children}</h2>
);

const Paragraph = ({ children }: { children: ReactNode }) => (
  <p className="text-xs mb-2">{children}</p>
)

const TermsOfService: NextPage = () => {
  return (
    <Layout navbar={{}}>
      <Head>{metadata.title('Terms of Service')}</Head>
      <div className="col-span-full">
        <div className="mt-4 mb-4 w-full px-4 md:px-16">
          <H1>TERMS OF SERVICE</H1>
          <Paragraph>Last updated: 2022-11-01</Paragraph>
          <H2>1. Introduction</H2>
          <Paragraph>
            Welcome to SHOWROOM (“Company”, “we”, “our”, “us”)!
            <br /><br />
            These Terms of Service (“Terms”, “Terms of Service”) govern your use of our website located at showroom.art (together or individually “Service”) operated by SHOWROOM.
            <br /><br />
            Our Privacy Policy also governs your use of our Service and explains how we collect, safeguard and disclose information that results from your use of our web pages.
            <br /><br />
            Your agreement with us includes these Terms and our Privacy Policy (“Agreements”). You acknowledge that you have read and understood Agreements, and agree to be bound of them.
            <br /><br />
            If you do not agree with (or cannot comply with) Agreements, then you may not use the Service. These Terms apply to all visitors, users and others who wish to access or use Service.
          </Paragraph>
          <H2>2. Assumption of Risk</H2>
          <Paragraph>
            You accept and acknowledge:
            <br /><br />
            <ul className="list-disc pl-4">
              <li>The value of an NFTs is subjective. Prices of NFTs are subject to volatility and fluctuations in the price of cryptocurrency can also materially and adversely affect NFT prices. You acknowledge that you fully understand this subjectivity and volatility and that you may lose money.</li>
              <li>A lack of use or public interest in the creation and development of distributed ecosystems could negatively impact the development of those ecosystems and related applications, and could therefore also negatively impact the potential utility of NFTs.</li>
              <li>The regulatory regime governing blockchain technologies, non-fungible tokens, cryptocurrency, and other crypto-based items is uncertain, and new regulations or policies may materially adversely affect the development of the Service and the utility of NFTs.</li>
              <li>You are solely responsible for determining what, if any, taxes apply to your transactions. SHOWROOM is not responsible for determining the taxes that apply to your NFTs.</li>
              <li>There are risks associated with purchasing items associated with content created by third parties through peer-to-peer transactions, including but not limited to, the risk of purchasing counterfeit items, mislabeled items, items that are vulnerable to metadata decay, items on smart contracts with bugs, and items that may become untransferable. You represent and warrant that you have done sufficient research before making any decisions to sell, obtain, transfer, or otherwise interact with any NFTs or accounts/collections.</li>
              <li>We do not control the public blockchains that you are interacting with and we do not control certain smart contracts and protocols that may be integral to your ability to complete transactions on these public blockchains. Additionally, blockchain transactions are irreversible and SHOWROOM has no ability to reverse any transactions on the blockchain.</li>
              <li>There are risks associated with using Internet and blockchain based products, including, but not limited to, the risk associated with hardware, software, and Internet connections, the risk of malicious software introduction, and the risk that third parties may obtain unauthorized access to your third-party wallet or Account. You accept and acknowledge that SHOWROOM will not be responsible for any communication failures, disruptions, errors, distortions or delays you may experience when using the Service or any Blockchain network, however caused.</li>
              <li>The Service relies on third-party platforms and/or vendors. If we are unable to maintain a good relationship with such platform providers and/or vendors; if the terms and conditions or pricing of such platform providers and/or vendors change; if we violate or cannot comply with the terms and conditions of such platforms and/or vendors; or if any of such platforms and/or vendors loses market share or falls out of favor or is unavailable for a prolonged period of time, access to and use of the Service will suffer.</li>
              <li>SHOWROOM reserves the right to hide collections, contracts, and items affected by any of these issues or by other issues. Items you purchase may become inaccessible on SHOWROOM. Under no circumstances shall the inability to view items on SHOWROOM or an inability to use the Service in conjunction with the purchase, sale, or transfer of items available on any blockchains serve as grounds for a claim against SHOWROOM.</li>
              <li>If you have a dispute with one or more users, YOU RELEASE US FROM CLAIMS, DEMANDS, AND DAMAGES OF EVERY KIND AND NATURE, KNOWN AND UNKNOWN, ARISING OUT OF OR IN ANY WAY CONNECTED WITH SUCH DISPUTES. IN ENTERING INTO THIS RELEASE YOU EXPRESSLY WAIVE ANY PROTECTIONS (WHETHER STATUTORY OR OTHERWISE) THAT WOULD OTHERWISE LIMIT THE COVERAGE OF THIS RELEASE TO INCLUDE THOSE CLAIMS WHICH YOU MAY KNOW OR SUSPECT TO EXIST IN YOUR FAVOR AT THE TIME OF AGREEING TO THIS RELEASE.</li>
            </ul>
            <div className="not-sure-y-needed-but-otherwise-styling-broken" />
          </Paragraph>
          <H2>3. Proprietary Rights</H2>
          <Paragraph>The intellectual property generated by core contributors to SHOWROOM and all material generated by Service are the property of SHOWROOM. You may not distribute, modify, transmit, reuse, download, repost, copy, or use said Content, whether in whole or in part, for commercial purposes or for personal gain, without express advance written permission from us.</Paragraph>
          <H2>4. Third-Party Content and Services</H2>
          <Paragraph>SHOWROOM helps you explore NFTs created by third parties and interact with different blockchains. SHOWROOM does not make any representations or warranties about this third-party content visible through our Service, including any content associated with NFTs displayed on the Service, and you bear responsibility for verifying the legitimacy, authenticity, and legality of NFTs that you purchase from third-party sellers. We also cannot guarantee that any NFTs visible on SHOWROOM will always remain visible and/or available to be bought, sold, or transferred.</Paragraph>
          <H2>5. Prohibited Uses</H2>
          <Paragraph>
            You may use Service only for lawful purposes and in accordance with Terms. You agree not to use Service:
            <br /><br />
            <ol className="list-decimal pl-4">
              <li>In any way that violates any applicable national or international law or regulation.</li>
              <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way by exposing them to inappropriate content or otherwise.</li>
              <li>To transmit, or procure the sending of, any advertising or promotional material, including any “junk mail”, “chain letter,” “spam,” or any other similar solicitation.</li>
              <li>To impersonate or attempt to impersonate Company, a Company employee, another user, or any other person or entity.</li>
              <li>In any way that infringes upon the rights of others, or in any way is illegal, threatening, fraudulent, or harmful, or in connection with any unlawful, illegal, fraudulent, or harmful purpose or activity.</li>
              <li>To engage in any other conduct that restricts or inhibits anyone’s use or enjoyment of Service, or which, as determined by us, may harm or offend Company or users of Service or expose them to liability.</li>
            </ol>
            <br />
            Additionally, you agree not to:
            <br /><br />
            <ol className="list-decimal pl-4">
              <li>Use Service in any manner that could disable, overburden, damage, or impair Service or interfere with any other party’s use of Service, including their ability to engage in real time activities through Service.</li>
              <li>Use any robot, spider, or other automatic device, process, or means to access Service for any purpose, including monitoring or copying any of the material on Service.</li>
              <li>Use any manual process to monitor or copy any of the material on Service or for any other unauthorized purpose without our prior written consent.</li>
              <li>Use any device, software, or routine that interferes with the proper working of Service.</li>
              <li>Introduce any viruses, trojan horses, worms, logic bombs, or other material which is malicious or technologically harmful.</li>
              <li>Attempt to gain unauthorized access to, interfere with, damage, or disrupt any parts of Service, the server on which Service is stored, or any server, computer, or database connected to Service.</li>
              <li>Attack Service via a denial-of-service attack or a distributed denial-of-service attack.</li>
              <li>Bypass any instructions that control access to the Service, including attempting to circumvent any rate limiting systems by using multiple API keys, or obfuscating the source of traffic you send to SHOWROOM;</li>
              <li>Take any action that may damage or falsify Company rating.</li>
              <li>Otherwise attempt to interfere with the proper working of Service.</li>
            </ol>
          </Paragraph>
          <H2>6. Analytics</H2>
          <Paragraph>We may use third-party Service Providers to monitor and analyze the use of our Service.</Paragraph>
          <H2>7. No Use By Minors</H2>
          <Paragraph>Service is intended only for access and use by individuals at least eighteen (18) years old. By accessing or using Service, you warrant and represent that you are at least eighteen (18) years of age and with the full authority, right, and capacity to enter into this agreement and abide by all of the terms and conditions of Terms. If you are not at least eighteen (18) years old, you are prohibited from both the access and usage of Service.</Paragraph>
          <H2>8. Intellectual Property</H2>
          <Paragraph>Service and its original content (excluding Content provided by users), features and functionality are and will remain the exclusive property of SHOWROOM and its licensors. Service is protected by copyright, trademark, and other laws of and foreign countries. Our trademarks may not be used in connection with any product or service without the prior written consent of SHOWROOM.</Paragraph>
          <H2>9. Copyright Policy</H2>
          <Paragraph>
            We respect the intellectual property rights of others. It is our policy to respond to any claim that Content posted on Service infringes on the copyright or other intellectual property rights (“Infringement”) of any person or entity.
            <br /><br />
            If you are a copyright owner, or authorized on behalf of one, and you believe that the copyrighted work has been copied in a way that constitutes copyright infringement, please submit your claim via Discord on https://discord.gg/dzVzMdp.
            <br /><br />
            You may be held accountable for damages (including costs and attorneys’ fees) for misrepresentation or bad-faith claims on the infringement of any Content found on and/or through Service on your copyright.
          </Paragraph>
          <H2>10. DMCA Notice and Procedure for Copyright Infringement Claims</H2>
          <Paragraph>
            You may submit a notification pursuant to the Digital Millennium Copyright Act (DMCA) by providing our Copyright Agent with the following information in writing (see 17 U.S.C 512(c)(3) for further detail):
            <br /><br />
            <ol className="list-decimal pl-4">
              <li>an electronic or physical signature of the person authorized to act on behalf of the owner of the copyright’s interest;</li>
              <li>a description of the copyrighted work that you claim has been infringed, including the URL (i.e., web page address) of the location where the copyrighted work exists or a copy of the copyrighted work;</li>
              <li>identification of the URL or other specific location on Service where the material that you claim is infringing is located;</li>
              <li>your address, telephone number, and email address;</li>
              <li>a statement by you that you have a good faith belief that the disputed use is not authorized by the copyright owner, its agent, or the law;</li>
              <li>a statement by you, made under penalty of perjury, that the above information in your notice is accurate and that you are the copyright owner or authorized to act on the copyright owner’s behalf.</li>
            </ol>
            <br />
            You can contact our Copyright Agent via Discord at https://discord.gg/dzVzMdp.
          </Paragraph>
          <H2>11. Error Reporting and Feedback</H2>
          <Paragraph>You may provide us either directly on Discord at https://discord.gg/dzVzMdp or via third party sites and tools with information and feedback concerning errors, suggestions for improvements, ideas, problems, complaints, and other matters related to our Service (“Feedback”). You acknowledge and agree that: (i) you shall not retain, acquire or assert any intellectual property right or other right, title or interest in or to the Feedback; (ii) Company may have development ideas similar to the Feedback; (iii) Feedback does not contain confidential information or proprietary information from you or any third party; and (iv) Company is not under any obligation of confidentiality with respect to the Feedback. In the event the transfer of the ownership to the Feedback is not possible due to applicable mandatory laws, you grant Company and its affiliates an exclusive, transferable, irrevocable, free-of-charge, sub-licensable, unlimited and perpetual right to use (including copy, modify, create derivative works, publish, distribute and commercialize) Feedback in any manner and for any purpose.</Paragraph>
          <H2>12. Links To Other Web Sites</H2>
          <Paragraph>
            Our Service may contain links to third party web sites or services that are not owned or controlled by SHOWROOM.
            <br /><br />
            SHOWROOM has no control over, and assumes no responsibility for the content, privacy policies, or practices of any third party web sites or services. We do not warrant the offerings of any of these entities/individuals or their websites.
            <br /><br />
            YOU ACKNOWLEDGE AND AGREE THAT COMPANY SHALL NOT BE RESPONSIBLE OR LIABLE, DIRECTLY OR INDIRECTLY, FOR ANY DAMAGE OR LOSS CAUSED OR ALLEGED TO BE CAUSED BY OR IN CONNECTION WITH USE OF OR RELIANCE ON ANY SUCH CONTENT, GOODS OR SERVICES AVAILABLE ON OR THROUGH ANY SUCH THIRD PARTY WEB SITES OR SERVICES.
            <br /><br />
            WE STRONGLY ADVISE YOU TO READ THE TERMS OF SERVICE AND PRIVACY POLICIES OF ANY THIRD PARTY WEB SITES OR SERVICES THAT YOU VISIT.
          </Paragraph>
          <H2>13. Disclaimer Of Warranty</H2>
          <Paragraph>
            THESE SERVICES ARE PROVIDED BY COMPANY ON AN “AS IS” AND “AS AVAILABLE” BASIS. COMPANY MAKES NO REPRESENTATIONS OR WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, AS TO THE OPERATION OF THEIR SERVICES, OR THE INFORMATION, CONTENT OR MATERIALS INCLUDED THEREIN. YOU EXPRESSLY AGREE THAT YOUR USE OF THESE SERVICES, THEIR CONTENT, AND ANY SERVICES OR ITEMS OBTAINED FROM US IS AT YOUR SOLE RISK.
            <br /><br />
            NEITHER COMPANY NOR ANY PERSON ASSOCIATED WITH COMPANY MAKES ANY WARRANTY OR REPRESENTATION WITH RESPECT TO THE COMPLETENESS, SECURITY, RELIABILITY, QUALITY, ACCURACY, OR AVAILABILITY OF THE SERVICES. WITHOUT LIMITING THE FOREGOING, NEITHER COMPANY NOR ANYONE ASSOCIATED WITH COMPANY REPRESENTS OR WARRANTS THAT THE SERVICES, THEIR CONTENT, OR ANY SERVICES OR ITEMS OBTAINED THROUGH THE SERVICES WILL BE ACCURATE, RELIABLE, ERROR-FREE, OR UNINTERRUPTED, THAT DEFECTS WILL BE CORRECTED, THAT THE SERVICES OR THE SERVER THAT MAKES IT AVAILABLE ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS OR THAT THE SERVICES OR ANY SERVICES OR ITEMS OBTAINED THROUGH THE SERVICES WILL OTHERWISE MEET YOUR NEEDS OR EXPECTATIONS.
            <br /><br />
            COMPANY HEREBY DISCLAIMS ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF MERCHANTABILITY, NON-INFRINGEMENT, AND FITNESS FOR PARTICULAR PURPOSE.
            <br /><br />
            THE FOREGOING DOES NOT AFFECT ANY WARRANTIES WHICH CANNOT BE EXCLUDED OR LIMITED UNDER APPLICABLE LAW.
          </Paragraph>
          <H2>14. Limitation Of Liability</H2>
          <Paragraph>
            EXCEPT AS PROHIBITED BY LAW, YOU WILL HOLD US AND OUR OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS HARMLESS FOR ANY INDIRECT, PUNITIVE, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGE, HOWEVER IT ARISES (INCLUDING ATTORNEYS’ FEES AND ALL RELATED COSTS AND EXPENSES OF LITIGATION AND ARBITRATION, OR AT TRIAL OR ON APPEAL, IF ANY, WHETHER OR NOT LITIGATION OR ARBITRATION IS INSTITUTED), WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE, OR OTHER TORTIOUS ACTION, OR ARISING OUT OF OR IN CONNECTION WITH THIS AGREEMENT, INCLUDING WITHOUT LIMITATION ANY CLAIM FOR PERSONAL INJURY OR PROPERTY DAMAGE, ARISING FROM THIS AGREEMENT AND ANY VIOLATION BY YOU OF ANY FEDERAL, STATE, OR LOCAL LAWS, STATUTES, RULES, OR REGULATIONS, EVEN IF COMPANY HAS BEEN PREVIOUSLY ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. EXCEPT AS PROHIBITED BY LAW, IF THERE IS LIABILITY FOUND ON THE PART OF COMPANY, IT WILL BE LIMITED TO THE AMOUNT PAID FOR THE PRODUCTS AND/OR SERVICES, AND UNDER NO CIRCUMSTANCES WILL THERE BE CONSEQUENTIAL OR PUNITIVE DAMAGES. SOME STATES DO NOT ALLOW THE EXCLUSION OR LIMITATION OF PUNITIVE, INCIDENTAL OR CONSEQUENTIAL DAMAGES, SO THE PRIOR LIMITATION OR EXCLUSION MAY NOT APPLY TO YOU.
          </Paragraph>
          <H2>15. Termination</H2>
          <Paragraph>
            We may terminate or suspend your account and bar access to Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of Terms.
            <br /><br />
            If you wish to terminate your account, you may simply discontinue using Service.
            <br /><br />
            All provisions of Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity and limitations of liability.
          </Paragraph>
          <H2>16. Governing Law</H2>
          <Paragraph>
            These Terms shall be governed and construed in accordance with all applicable laws, which governing law applies to agreement without regard to its conflict of law provisions.
            <br /><br />
            Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect. These Terms constitute the entire agreement between us regarding our Service and supersede and replace any prior agreements we might have had between us regarding Service.
          </Paragraph>
          <H2>17. Changes To Service</H2>
          <Paragraph>We reserve the right to withdraw or amend our Service, and any service or material we provide via Service, in our sole discretion without notice. We will not be liable if for any reason all or any part of Service is unavailable at any time or for any period. From time to time, we may restrict access to some parts of Service, or the entire Service, to users, including registered users.</Paragraph>
          <H2>18. Amendments To Terms</H2>
          <Paragraph>
            We may amend Terms at any time by posting the amended terms on this site. It is your responsibility to review these Terms periodically.
            <br /><br />
            Your continued use of the Platform following the posting of revised Terms means that you accept and agree to the changes. You are expected to check this page frequently so you are aware of any changes, as they are binding on you.
            <br /><br />
            By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use Service.
          </Paragraph>
          <H2>19. Waiver And Severability</H2>
          <Paragraph>
            No waiver by Company of any term or condition set forth in Terms shall be deemed a further or continuing waiver of such term or condition or a waiver of any other term or condition, and any failure of Company to assert a right or provision under Terms shall not constitute a waiver of such right or provision.
            <br /><br />
            If any provision of Terms is held by a court or other tribunal of competent jurisdiction to be invalid, illegal or unenforceable for any reason, such provision shall be eliminated or limited to the minimum extent such that the remaining provisions of Terms will continue in full force and effect.
          </Paragraph>
          <H2>20. Acknowledgement</H2>
          <Paragraph>
            BY USING SERVICE OR OTHER SERVICES PROVIDED BY US, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE AND AGREE TO BE BOUND BY THEM.
          </Paragraph>
          <H2>21. Contact Us</H2>
          <Paragraph>
            Please send your feedback, comments, requests for technical support on Discord https://discord.gg/dzVzMdp.
          </Paragraph>
        </div>
      </div>
    </Layout>
  );
}

export default TermsOfService;
