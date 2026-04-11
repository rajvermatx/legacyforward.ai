---
title: "The Mainframe Is Still Running Your Money"
slug: "the-mainframe"
description: "Mainframes process trillions of dollars in transactions every day. Understanding why they still exist — and why they are not going anywhere — is essential context for enterprise AI."
section: "enterprise-it-101"
order: 4
part: "Part 01 The Foundation"
---

# The Mainframe Is Still Running Your Money

The mainframe computer was declared dead approximately fifty times between 1980 and today. It is still running.

The IBM mainframe — and its ecosystem of related technology — processes an estimated seventy percent of all global transaction processing. That includes most major bank transactions, the majority of airline reservation systems, a large portion of government benefit payments, and the systems that settle credit card transactions worldwide.

If you have used an ATM, booked a flight, received a social security payment, or paid with a credit card today, there is a very good chance a mainframe processed part of that transaction.

## What a Mainframe Actually Is

A mainframe is a type of computer designed for high-volume, high-reliability transaction processing. The name comes from the large metal frames that housed the early machines, but modern mainframes bear little physical resemblance to those original machines. What has stayed consistent is the purpose: processing enormous volumes of transactions with exceptional reliability and speed.

Modern mainframes can process billions of transactions per day. They are designed to be available essentially all the time — the target uptime for mainframe systems is often measured in minutes of downtime per year, not hours. They support hot-swappable components, meaning parts can be replaced while the system is running, without taking it offline.

The primary language still widely used to write mainframe applications is COBOL — Common Business-Oriented Language — which was created in 1959. This often surprises people. But consider: the business rules encoded in a payroll system, a banking core, or an insurance claims system have not changed that much in fifty years. The calculations for compound interest, the rules for benefit eligibility, the logic for settling a securities trade — these are stable. The code that implements them, once it works, tends to stay working.

## Why Mainframes Persist

The obvious question is: why not replace them with modern technology?

The answer is a combination of reliability, performance, cost of replacement, and risk.

**Reliability.** Modern cloud infrastructure is impressive, but it is designed with the assumption that individual components will fail and the system will route around them. Mainframes are designed so that individual components almost never fail. For certain transaction types — financial settlement, benefits processing, airline reservations — the tolerance for failure is effectively zero. The mainframe was engineered for that tolerance. Replicating it with distributed cloud architecture is possible but requires significant engineering investment.

**Performance.** At very high transaction volumes, mainframes remain extremely efficient. The hardware is optimized for exactly the kind of structured, high-volume transaction processing that financial and government systems require. Modern distributed systems can match this performance, but often require significantly more infrastructure.

**Cost of replacement.** The mainframe might look expensive as a line item, but it is processing millions of transactions per hour. When you calculate cost per transaction, it is often cheaper than the alternatives. More importantly, the cost of replacing the mainframe is enormous — not primarily because of the hardware, but because of the software. Decades of COBOL code would need to be rewritten, tested, validated, and migrated. The business rules embedded in that code would need to be fully understood and reproduced. For major financial institutions, this is a multi-year, multi-billion-dollar project with significant risk of failure.

**Risk.** Every major attempt to replace a core banking system or large government mainframe has stories of projects that ran over budget, ran over schedule, or failed outright. The systems are so central to operations that errors during migration can have immediate, visible consequences — payments not processed, benefits not paid, accounts showing wrong balances. The risk of getting it wrong is so high that many organizations have decided that running the mainframe indefinitely is the more rational choice.

## The COBOL Problem

One of the most discussed aspects of mainframe persistence is the COBOL skills gap. The language is old. Computer science programs stopped teaching it decades ago. The people who have deep COBOL expertise are approaching or past retirement age.

This creates a risk: organizations that depend on COBOL systems may find themselves with aging code that fewer and fewer people can read, debug, or extend. When something breaks — or when a regulatory change requires the code to be modified — finding the right expertise becomes increasingly difficult and expensive.

This is a real concern, but it is often overstated. There is still a significant COBOL developer community, and organizations that depend on COBOL systems invest in training and in automated tools that help modernize or extend COBOL code without fully replacing it. The crisis has been predicted for decades and has not fully materialized because the economic incentives to maintain COBOL expertise remain strong as long as the systems that require it are running.

## What This Means for AI

Here is the practical implication for AI practitioners: if you are working at a large financial institution, a government agency, an insurance company, or any other organization that relies on mainframe transaction processing, the data that AI needs is probably in or flowing through that mainframe.

Getting that data into a modern AI system is not impossible, but it requires understanding how the mainframe exposes data, what format that data is in, and what the latency and volume constraints are. The mainframe does not have a REST API the way a modern cloud service does. It has its own interfaces — batch file exports, VSAM data sets, IBM MQ message queues — that require specific knowledge to work with.

This is not an insurmountable problem. But it is a real one, and recognizing it early saves significant time and frustration. The AI model is the easy part. Getting clean data out of the mainframe in the right format at the right frequency is where the work actually lives.
